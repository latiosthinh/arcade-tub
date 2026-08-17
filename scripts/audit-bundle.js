import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, '..', 'dist');
const MAX_BUDGET_KB = 200;
const MAX_BUDGET_BYTES = MAX_BUDGET_KB * 1024;

if (!fs.existsSync(distDir)) {
  console.error(`Error: dist directory does not exist at ${distDir}. Run build first.`);
  process.exit(1);
}

function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getAllFiles(filePath, fileList);
    } else {
      fileList.push(filePath);
    }
  }
  return fileList;
}

const allFiles = getAllFiles(distDir);
let hasError = false;

console.log(`\n=== Production Bundle Audit (< ${MAX_BUDGET_KB}KB Limit) ===\n`);
console.log('File'.padEnd(45) + 'Raw Size'.padEnd(15) + 'Gzip Size'.padEnd(15) + 'Status');
console.log('-'.repeat(85));

let totalRaw = 0;
let totalGzip = 0;

for (const filePath of allFiles) {
  const relPath = path.relative(distDir, filePath).replace(/\\/g, '/');
  const buffer = fs.readFileSync(filePath);
  const rawSize = buffer.length;
  const gzipSize = zlib.gzipSync(buffer).length;

  totalRaw += rawSize;
  totalGzip += gzipSize;

  const rawFormatted = `${(rawSize / 1024).toFixed(2)} KB`;
  const gzipFormatted = `${(gzipSize / 1024).toFixed(2)} KB`;
  const isOverBudget = gzipSize > MAX_BUDGET_BYTES;

  if (isOverBudget) {
    hasError = true;
  }

  const status = isOverBudget ? '❌ EXCEEDS LIMIT' : '✅ PASS';
  console.log(
    relPath.padEnd(45) +
    rawFormatted.padEnd(15) +
    gzipFormatted.padEnd(15) +
    status
  );
}

console.log('-'.repeat(85));
console.log(
  'Total'.padEnd(45) +
  `${(totalRaw / 1024).toFixed(2)} KB`.padEnd(15) +
  `${(totalGzip / 1024).toFixed(2)} KB`.padEnd(15) +
  (hasError ? '❌ FAIL' : '✅ PASS')
);
console.log(`\nAudit result: ${hasError ? 'FAILED' : 'PASSED'} - All entries under ${MAX_BUDGET_KB}KB.`);

if (hasError) {
  process.exit(1);
}
