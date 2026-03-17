import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const currentFilePath = fileURLToPath(import.meta.url);
const currentDir = path.dirname(currentFilePath);

export const repoRoot = path.resolve(currentDir, '..');
export const packagesDir = path.join(repoRoot, 'packages');
const depFields = ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies'];

export function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

export function writeJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

export function getPackageDirs() {
  return fs.readdirSync(packagesDir)
    .map((name) => path.join(packagesDir, name))
    .filter((dir) => fs.existsSync(path.join(dir, 'package.json')))
    .sort();
}

export function loadPackages() {
  return getPackageDirs().map((dir) => {
    const packageJsonPath = path.join(dir, 'package.json');
    const packageJson = readJson(packageJsonPath);
    return {
      dir,
      dirName: path.basename(dir),
      packageJsonPath,
      packageJson,
      name: packageJson.name,
      version: packageJson.version
    };
  });
}

export function createPackageMap(packages) {
  return new Map(packages.map((pkg) => [pkg.name, pkg]));
}

export function syncInternalDependencyRanges(packages, options = {}) {
  const { exact = false } = options;
  const packageMap = createPackageMap(packages);
  const versionPrefix = exact ? '' : '^';
  let changed = false;

  for (const pkg of packages) {
    for (const field of depFields) {
      const deps = pkg.packageJson[field];
      if (!deps || typeof deps !== 'object') continue;

      for (const depName of Object.keys(deps)) {
        const internalPkg = packageMap.get(depName);
        if (!internalPkg) continue;

        const nextRange = `${versionPrefix}${internalPkg.packageJson.version}`;
        if (deps[depName] !== nextRange) {
          deps[depName] = nextRange;
          changed = true;
        }
      }
    }
  }

  return changed;
}

export function savePackages(packages) {
  for (const pkg of packages) {
    writeJson(pkg.packageJsonPath, pkg.packageJson);
  }
}

export function findPackage(packages, identifier) {
  return packages.find((pkg) => pkg.name === identifier || pkg.dirName === identifier);
}

export function getInternalDeps(pkg, packageMap) {
  const deps = new Set();
  for (const field of ['dependencies', 'peerDependencies']) {
    const section = pkg.packageJson[field];
    if (!section || typeof section !== 'object') continue;
    for (const depName of Object.keys(section)) {
      if (packageMap.has(depName)) deps.add(depName);
    }
  }
  return [...deps];
}

export function sortPackagesTopologically(packages) {
  const packageMap = createPackageMap(packages);
  const remaining = new Map(packages.map((pkg) => [pkg.name, { pkg, deps: new Set(getInternalDeps(pkg, packageMap)) }]));
  const sorted = [];

  while (remaining.size > 0) {
    const ready = [...remaining.values()]
      .filter(({ deps }) => deps.size === 0)
      .map(({ pkg }) => pkg)
      .sort((a, b) => a.name.localeCompare(b.name));

    if (ready.length === 0) {
      throw new Error('Could not resolve package publish order due to a dependency cycle.');
    }

    for (const pkg of ready) {
      sorted.push(pkg);
      remaining.delete(pkg.name);
      for (const entry of remaining.values()) {
        entry.deps.delete(pkg.name);
      }
    }
  }

  return sorted;
}
