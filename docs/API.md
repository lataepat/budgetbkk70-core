# API and input contracts

All functions are named exports from `src/index.mjs`.

## Budget chart

`allocationArcs(parts, total)` accepts objects with a finite, non-negative `amount`. It returns copies with `share` and SVG `d` fields. Paths use a 400 × 400 coordinate system, centre 200/200, and radius 167. Zero slices have an empty path. A non-positive total, invalid amount, or sum differing by more than 0.01 units returns `[]`; it never rescales an incomplete breakdown to 100%.

## Record identity and merging

`logicalRecordKey(record)` returns a JSON tuple string for `[record_id, district]`. These fields must be strings. Do not parse the key as a pipe-delimited string.

`mergeUniqueSearchRecords(areaRecords, details)` retains each area record's public `view_id` and district presentation, adds detail-only fields, and then appends details not already represented. Area fields take precedence. Exact identity-plus-district matches are preferred; an unambiguous detail without a `view_role` may supply a legacy fallback. Inputs are not mutated. Each input list must be internally unique; this API is not a general deduplicator.

`indexCanonicalDistricts(records, validDistricts)` returns a `Map<string, string[]>` keyed by `canonical_view_id || view_id`. It gathers the record's `district` and `related_districts`, restricted to the supplied valid district names. Build this index before applying a display filter. Returned arrays retain encounter order; they are not a ranking.

## Packed JSON

`packBudgetJson(value)` returns `{ format: 'budget-packed-v1', strings, shapes, root }`. Repeated strings and object-key shapes share dictionaries. `unpackBudgetJson(packed)` reverses this representation and rejects invalid dictionary references, duplicate shape keys, malformed records, and non-finite encoded values. Objects with an own `__proto__` field remain ordinary data; decoding does not assign to the object's prototype.

Input should be plain JSON data: strings, finite numbers, booleans, null, dense arrays, and plain objects with JSON-valued enumerable string properties. Unsupported values and cycles throw. Negative zero becomes zero, consistent with JSON serialization. JavaScript prototypes, accessors, non-enumerable properties, and custom array properties are outside the data contract. Apply byte and nesting limits before processing untrusted input. No schema validation or authenticity guarantee is implied.

`fetchBudgetJson(url)` uses the environment's global `fetch`, rejects an unsuccessful HTTP response, and decodes the packed response. It does not cache, retry, follow a custom authentication flow, or manage spending. Plain, unpacked JSON is not accepted by this helper.

## District metrics

`mapMetricValue(row, metric)` returns a finite non-negative number or `null`. Use these supported metric names:

| Metric | Input field |
| --- | --- |
| `office` | `district_office_budget` |
| `central` | `central_exclusive_budget_safe_to_attribute` |
| `minimum` | `minimum_verified_budget` |

The extracted implementation falls back to `minimum` for other strings; callers should validate the metric against the supported names. String-encoded numbers are treated as missing.

`districtMapScale(rows, metric)` returns `{ ordered, entries, unrankedCount }`. Positive amounts use competition ranks (1, 1, 3). Equal amounts get equal bands. Zero and missing values are unranked with band 0, but their stored values remain distinct. The five ordinal colour bands show relative ranks, not equal money intervals. District names must be unique strings. Ties are sorted using Thai collation.

`mapRoute(district = '', metric = 'office')` produces a URL-encoded hash route.

`mapCameraViewBox({ x, y, zoom }, width, height, mapWidth, mapHeight)` returns `[x, y, width, height]` in map coordinates. All dimensions and zoom must be positive finite numbers, with finite pan coordinates. Validation of those geometric inputs belongs to the caller.
