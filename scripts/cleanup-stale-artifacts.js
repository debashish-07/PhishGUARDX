const fs = require('fs');
const path = require('path');

const workspaceRoot = path.resolve(__dirname, '..');
const dryRun = !process.argv.includes('--force');

const targets = [
  'full_test_results.txt',
  'full_test_results_latest.txt',
  'full_test_results_run.txt',
  'test-output.txt',
  'PROJECT_REPORT.html',
  'phishguardx-test-report.pdf',
];

function removeTarget(relativePath) {
  const absolutePath = path.join(workspaceRoot, relativePath);

  if (!fs.existsSync(absolutePath)) {
    console.log(`skip  ${relativePath} (not found)`);
    return;
  }

  if (dryRun) {
    console.log(`dry   ${relativePath}`);
    return;
  }

  fs.rmSync(absolutePath, { force: true });
  console.log(`delete ${relativePath}`);
}

console.log(dryRun ? 'Dry run: no files will be deleted.' : 'Deleting stale generated files.');
console.log('Targeting generated outputs only; source files are untouched.\n');

for (const target of targets) {
  removeTarget(target);
}

console.log('\nDone.');
if (dryRun) {
  console.log('Run again with --force to delete the listed files.');
}