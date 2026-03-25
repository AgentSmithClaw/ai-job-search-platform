const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const distDir = path.join(repoRoot, 'frontend', 'dist');
const publicDir = path.join(repoRoot, 'public');

if (!fs.existsSync(distDir)) {
  throw new Error(`Build output not found: ${distDir}`);
}

fs.rmSync(publicDir, { recursive: true, force: true });
fs.mkdirSync(publicDir, { recursive: true });
fs.cpSync(distDir, publicDir, { recursive: true });

console.log(`Published frontend assets to ${publicDir}`);
