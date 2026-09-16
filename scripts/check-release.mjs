import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const root = path.resolve(import.meta.dirname, '..');
const required = ['LICENSE', 'README.md', 'CONTRIBUTING.md', 'SECURITY.md', 'MAINTAINERS.md', 'CHANGELOG.md', 'docs/PROVENANCE.md', 'src/index.mjs', 'src/index.d.mts'];
for (const file of required) assert.ok(fs.statSync(path.join(root, file)).isFile(), `Missing ${file}`);
const packageJson = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
assert.equal(packageJson.license, 'MIT');
assert.equal(Object.keys(packageJson.dependencies || {}).length, 0);
const forbidden = [/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/, /\bgh[pousr]_[A-Za-z0-9]{30,}\b/, /\bsk-(?:proj-)?[A-Za-z0-9_-]{35,}\b/, /git\.chatgpt-team\.site\//, /appgprj_[a-z0-9]+/];
let count = 0;
function visit(dir) {
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['.git', 'node_modules'].includes(item.name)) continue;
    const file = path.join(dir, item.name);
    if (item.isDirectory()) { visit(file); continue; }
    if (/\.(tgz|zip)$/.test(item.name)) continue;
    assert.ok(!item.name.startsWith('.env'), 'Environment files must not be released');
    assert.ok(!item.isSymbolicLink(), 'Release must not contain symlinks');
    const text = fs.readFileSync(file, 'utf8');
    for (const pattern of forbidden) assert.ok(!pattern.test(text), `Sensitive pattern in ${path.relative(root, file)}`);
    count++;
  }
}
visit(root);
console.log(`Release file check passed for ${count} files; no runtime dependencies or matched sensitive patterns.`);
