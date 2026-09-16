import test from 'node:test';
import assert from 'node:assert/strict';
import {
  allocationArcs, logicalRecordKey, mergeUniqueSearchRecords, indexCanonicalDistricts,
  packBudgetJson, unpackBudgetJson, fetchBudgetJson, districtMapScale,
  mapMetricValue, mapRoute, mapCameraViewBox,
} from '../src/index.mjs';

test('a complete budget yields its actual shares and a closed chart', () => {
  const arcs = allocationArcs([{ name: 'A', amount: 60 }, { name: 'B', amount: 40 }], 100);
  assert.deepEqual(arcs.map(a => a.share), [0.6, 0.4]);
  assert.match(arcs[0].d, /^M 200 33 /);
  assert.ok(arcs.at(-1).d.endsWith('200 33'));
});
test('incomplete, over-counted, and invalid budgets do not become complete charts', () => {
  for (const [parts, total] of [[[{ amount: 80 }], 100], [[{ amount: 120 }], 100], [[{ amount: -1 }, { amount: 101 }], 100], [[{ amount: NaN }], 1], [[{ amount: Infinity }], 1], [[], 0]]) {
    assert.deepEqual(allocationArcs(parts, total), []);
  }
});
test('one full slice draws two arcs; a zero slice remains empty', () => {
  const arcs = allocationArcs([{ amount: 100 }, { amount: 0 }], 100);
  assert.equal((arcs[0].d.match(/A 167/g) || []).length, 2);
  assert.equal(arcs[1].d, '');
});
test('record identity does not collide when identifiers contain delimiters', () => {
  assert.notEqual(logicalRecordKey({ record_id: 'a|b', district: 'c' }), logicalRecordKey({ record_id: 'a', district: 'b|c' }));
});
test('merging enriches a record once and preserves its public route and amount', () => {
  const area = [{ record_id: '1', district: 'A', view_id: 'area', budget_amount: 100 }];
  const detail = [{ record_id: '1', district: 'A', view_id: 'detail', source_page: 8, budget_amount: 120 }];
  const before = structuredClone([area, detail]);
  const result = mergeUniqueSearchRecords(area, detail);
  assert.equal(result.length, 1);
  assert.deepEqual(result[0], { ...detail[0], ...area[0] });
  assert.deepEqual([area, detail], before);
});
test('the same item in two district views retains both scopes', () => {
  const result = mergeUniqueSearchRecords([{ record_id: '1', district: 'A', view_id: 'a' }], [
    { record_id: '1', district: 'A', view_id: 'a-detail' },
    { record_id: '1', district: 'B', view_id: 'b', view_role: 'area_projection' },
  ]);
  assert.deepEqual(result.map(r => r.district), ['A', 'B']);
});
test('ambiguous detail variants are not used as a legacy fallback', () => {
  const result = mergeUniqueSearchRecords([{ record_id: '1', district: 'C', view_id: 'c' }], [
    { record_id: '1', district: 'A', view_id: 'a', source_page: 1 },
    { record_id: '1', district: 'B', view_id: 'b', source_page: 2 },
  ]);
  assert.equal(result[0].source_page, undefined);
  assert.equal(result.length, 3);
});
test('an unambiguous legacy detail can enrich an area record', () => {
  const result = mergeUniqueSearchRecords([{ record_id: '1', district: 'A', view_id: 'a' }], [
    { record_id: '1', district: '', view_id: 'legacy', source_page: 8 },
  ]);
  assert.equal(result[0].source_page, 8);
  assert.equal(result[0].district, 'A');
});
test('canonical district scope survives display filtering and excludes unknown areas', () => {
  const rows = [
    { record_id: '1', district: 'A', view_id: 'canonical', related_districts: ['B', 'outside'] },
    { record_id: '1', district: 'C', view_id: 'projection', canonical_view_id: 'canonical' },
  ];
  assert.deepEqual(new Set(indexCanonicalDistricts(rows, ['A', 'B', 'C']).get('canonical')), new Set(['A', 'B', 'C']));
});
test('transport preserves Thai marks, whitespace, JSON scalars and large safe amounts', () => {
  const original = [null, true, false, 0, 93918922000, '', [], {}, [null], {
    district: 'ป้อมปราบศัตรูพ่าย', text: 'น้ำ\nก่ ก้ ก๊ ก๋\t', amount: 256109100, missing: null,
  }, { text: 'น\u0e49\u0e33', amount: 0 }];
  assert.deepEqual(unpackBudgetJson(JSON.parse(JSON.stringify(packBudgetJson(original)))), original);
});
test('own special keys cannot modify the decoded object prototype', () => {
  const original = JSON.parse('{"__proto__":{"polluted":true},"constructor":false}');
  const decoded = unpackBudgetJson(packBudgetJson(original));
  assert.deepEqual(decoded, original);
  assert.equal(Object.getPrototypeOf(decoded), Object.prototype);
  assert.equal({}.polluted, undefined);
});
test('unsupported non-JSON values fail before a lossy transport is produced', () => {
  for (const value of [undefined, NaN, Infinity, 1n, Symbol('x'), () => 1, new Date(), new Map(), { a: undefined }, new Array(2), { [Symbol('x')]: 1 }]) {
    assert.throws(() => packBudgetJson(value), TypeError);
  }
});
test('cycles fail while repeated non-cyclic objects are valid', () => {
  const cyclic = {}; cyclic.self = cyclic;
  assert.throws(() => packBudgetJson(cyclic), /Cyclic/);
  const shared = { label: 'ถนน', amount: 4 };
  assert.deepEqual(unpackBudgetJson(packBudgetJson([shared, shared])), [shared, shared]);
});
test('negative zero is documented JSON zero', () => {
  assert.equal(Object.is(unpackBudgetJson(packBudgetJson(-0)), -0), false);
});
test('malformed references, duplicate shapes and non-finite encoded values are rejected', () => {
  for (const root of [[], [-1], [9], [false, 0], [false, 1], {}, 'plain', Infinity]) {
    assert.throws(() => unpackBudgetJson({ format: 'budget-packed-v1', strings: ['a'], shapes: [['a']], root }));
  }
  assert.throws(() => unpackBudgetJson({ format: 'unknown' }));
  assert.throws(() => unpackBudgetJson({ format: 'budget-packed-v1', strings: [], shapes: [['a', 'a']], root: [false, 0, 1, 2] }));
});
test('repetitive budget records share dictionaries and survive a JSON wire round trip', () => {
  const data = Array.from({ length: 250 }, (_, i) => ({ district: 'สัมพันธวงศ์', label: 'ถนนและทางเท้า', amount: i }));
  const packed = packBudgetJson(data);
  assert.ok(JSON.stringify(packed).length < JSON.stringify(data).length);
  assert.deepEqual(unpackBudgetJson(JSON.parse(JSON.stringify(packed))), data);
});
test('fetch helper decodes responses and rejects unsuccessful HTTP responses', async t => {
  t.mock.method(globalThis, 'fetch', async () => new Response(JSON.stringify(packBudgetJson({ amount: 5 }))));
  assert.deepEqual(await fetchBudgetJson('https://example.test/budget'), { amount: 5 });
  t.mock.method(globalThis, 'fetch', async () => new Response('missing', { status: 404 }));
  await assert.rejects(fetchBudgetJson('https://example.test/missing'));
});
test('equal district amounts have the same competition rank and colour band', () => {
  const rows = [{ district: 'A', district_office_budget: 100 }, { district: 'B', district_office_budget: 50 }, { district: 'C', district_office_budget: 100 }];
  const a = districtMapScale(rows, 'office');
  assert.deepEqual(a.entries.get('A'), a.entries.get('C'));
  assert.equal(a.entries.get('B').rank, 3);
  assert.deepEqual(a.ordered, districtMapScale([...rows].reverse(), 'office').ordered);
});
test('zero, missing, negative and string-encoded amounts cannot receive a positive rank', () => {
  const rows = [{ district: 'known', district_office_budget: 3 }, { district: 'zero', district_office_budget: 0 }, { district: 'missing' }, { district: 'negative', district_office_budget: -1 }, { district: 'string', district_office_budget: '7' }];
  const result = districtMapScale(rows, 'office');
  assert.equal(result.entries.get('zero').value, 0);
  assert.equal(result.entries.get('missing').value, null);
  assert.equal(result.unrankedCount, 4);
  for (const name of ['zero', 'missing', 'negative', 'string']) assert.equal(result.entries.get(name).rank, null);
});
test('metric selection separates office, attributable central, and minimum totals', () => {
  const row = { district: 'A', district_office_budget: 5, central_exclusive_budget_safe_to_attribute: 2, minimum_verified_budget: 7 };
  assert.equal(mapMetricValue(row, 'office'), 5);
  assert.equal(mapMetricValue(row, 'central'), 2);
  assert.equal(mapMetricValue(row, 'minimum'), 7);
});
test('map links preserve Thai names and special URL characters', () => {
  const params = new URLSearchParams(mapRoute('ป้อมปราบศัตรูพ่าย & A', 'central').split('?')[1]);
  assert.equal(params.get('district'), 'ป้อมปราบศัตรูพ่าย & A');
  assert.equal(params.get('metric'), 'central');
});
test('camera pan and zoom preserve geography in phone and desktop viewports', () => {
  for (const [width, height] of [[288, 280], [720, 610], [1200, 610]]) {
    const scale = Math.min(width / 1400, height / 1112);
    const left = (width - 1400 * scale) / 2, top = (height - 1112 * scale) / 2;
    for (const zoom of [1, 2, 8]) {
      const view = { zoom, x: -width * (zoom - 1) / 2, y: -height * (zoom - 1) / 2 };
      const [vx, vy, vw, vh] = mapCameraViewBox(view, width, height, 1400, 1112);
      assert.ok(Math.abs(vw / vh - width / height) < 1e-10);
      for (const [x, y] of [[0, 0], [700, 556], [1400, 1112]]) {
        assert.ok(Math.abs((x - vx) / vw * width - ((x * scale + left) * zoom + view.x)) < 1e-8);
        assert.ok(Math.abs((y - vy) / vh * height - ((y * scale + top) * zoom + view.y)) < 1e-8);
      }
    }
  }
});
