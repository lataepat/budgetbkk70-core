import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { packBudgetJson, unpackBudgetJson } from '../src/index.mjs';

const source = process.argv[2];
if (!source) {
  console.error('Usage: npm run verify:source -- /path/to/BudgetBKK70/public/data');
  console.error('Optional check for a separately obtained source snapshot; no data is downloaded.');
  process.exit(2);
}
const names = ['budget_totals.json', 'district_area_summary.json', 'source_documents.json'];
const loaded = new Map();
for (const name of names) {
  const bytes = fs.readFileSync(path.join(source, name));
  const data = JSON.parse(bytes);
  assert.deepEqual(unpackBudgetJson(JSON.parse(JSON.stringify(packBudgetJson(data)))), data);
  loaded.set(name, data);
  console.log(`${name} sha256=${createHash('sha256').update(bytes).digest('hex')} round-trip=pass`);
}
const framework = loaded.get('budget_totals.json');
const districts = loaded.get('district_area_summary.json');
const documents = loaded.get('source_documents.json');
assert.equal(districts.length, 50);
assert.equal(documents.length, 78);
assert.equal(documents.filter(d => d.source_group === 'สำนักส่วนกลาง' && Number(d.document_budget_total || 0) > 0).length, 22);
assert.equal(framework.official_total_budget, framework.allocated_budget_72_units + framework.central_budget);
console.log('Source snapshot coverage and arithmetic checks passed. This does not verify every PDF or establish usage.');
