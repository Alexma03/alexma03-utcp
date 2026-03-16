import { findPackage, loadPackages, savePackages, syncInternalDependencyRanges } from './monorepo-utils.mjs';

const [, , pkgIdentifier, nextVersion] = process.argv;

if (!pkgIdentifier || !nextVersion) {
  console.error('Usage: node scripts/bump-package-version.mjs <package-name|dir> <version>');
  process.exit(1);
}

const packages = loadPackages();
const target = findPackage(packages, pkgIdentifier);

if (!target) {
  console.error(`Package not found: ${pkgIdentifier}`);
  process.exit(1);
}

target.packageJson.version = nextVersion;
syncInternalDependencyRanges(packages);
savePackages(packages);

console.log(`Updated ${target.name} to ${nextVersion} and synchronized internal dependency ranges.`);
