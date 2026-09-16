import {
  allocationArcs, packBudgetJson, unpackBudgetJson,
  mergeUniqueSearchRecords, districtMapScale,
} from '../src/index.mjs';

// Synthetic fixtures: these amounts are not Bangkok budget claims.
const allocations = [{ label: 'ถนนและทางเท้า', amount: 60 }, { label: 'โรงเรียน', amount: 40 }];
const arcs = allocationArcs(allocations, 100);
console.log('Reconciled shares:', arcs.map(({ label, share }) => ({ label, share })));
console.log('Incomplete budget:', allocationArcs([{ amount: 80 }], 100));
console.log('Thai JSON round trip:', unpackBudgetJson(JSON.parse(JSON.stringify(packBudgetJson(allocations)))));

const area = [{ record_id: 'DEMO-001', district: 'พระนคร', view_id: 'area-001', budget_amount: 60 }];
const detail = [{ record_id: 'DEMO-001', district: 'พระนคร', view_id: 'detail-001', source_page: 5 }];
console.log('One enriched record:', mergeUniqueSearchRecords(area, detail));

const scale = districtMapScale([
  { district: 'พระนคร', district_office_budget: 60 },
  { district: 'บางรัก', district_office_budget: 0 },
  { district: 'ดุสิต' },
], 'office');
console.log('Known zero and missing stay different:', [...scale.entries]);
