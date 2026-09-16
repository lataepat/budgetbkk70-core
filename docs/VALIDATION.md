# Validation — 16 September 2026

Checked locally with Node.js 24.19.0.

| Check | Result |
| --- | --- |
| Standalone package tests | 22 passed, 0 failed |
| Synthetic example | Passed |
| Import from the packed npm distribution | Passed |
| Release file and sensitive-pattern check | Passed |
| Source snapshot total/coverage/deduplication tests | 13 passed, 0 failed |
| Pack/unpack of three real source JSON files | Exact round trip passed |
| GitHub Actions | Configured; not executed remotely |
| Node 22 execution | Configured in CI; not executed locally |
| TypeScript consumer compilation | Not run; compiler unavailable in this workspace |
| Full source website build | Not performed |

The standalone package tests exercise numeric reconciliation, incomplete allocations, duplicate presentation variants, multi-district scope, Thai marks, malformed JSON dictionaries, unsupported inputs, special object keys, tied district ranks, missing values, and vector camera geometry.

The optional source-data check is reproducible with `npm run verify:source -- /path/to/BudgetBKK70/public/data`. Source datasets are not bundled. It checks extracted-data structure and arithmetic; it does not independently inspect every government PDF.

No external audit, broad adoption measurement, or performance guarantee is asserted.
