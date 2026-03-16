import { loadPackages, savePackages, syncInternalDependencyRanges } from './monorepo-utils.mjs';

const exact = process.argv.includes('--exact');
const packages = loadPackages();
const changed = syncInternalDependencyRanges(packages, { exact });
savePackages(packages);

if (changed) {
  console.log(`Synchronized internal dependency ranges${exact ? ' with exact versions' : ''}.`);
} else {
  console.log('Internal dependency ranges are already synchronized.');
}
