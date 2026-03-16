import { execFileSync, spawnSync } from 'child_process';
import { loadPackages, sortPackagesTopologically } from './monorepo-utils.mjs';

const dryRun = process.argv.includes('--dry-run');
const packages = sortPackagesTopologically(loadPackages());

function isPublished(name, version) {
  try {
    execFileSync('npm', ['view', `${name}@${version}`, 'version', '--json'], { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

const changedPackages = packages.filter((pkg) => !isPublished(pkg.name, pkg.packageJson.version));

if (changedPackages.length === 0) {
  console.log('No unpublished package versions found.');
  process.exit(0);
}

console.log('Packages to publish:');
for (const pkg of changedPackages) {
  console.log(`- ${pkg.name}@${pkg.packageJson.version}`);
}

if (dryRun) {
  process.exit(0);
}

for (const pkg of changedPackages) {
  const result = spawnSync('npm', ['publish', '--access', 'public'], {
    cwd: pkg.dir,
    stdio: 'inherit'
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}
