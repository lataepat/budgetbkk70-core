# BudgetBKK70 Core

Small JavaScript utilities extracted from [งบใกล้บ้าน / BudgetBKK70](https://budgetbkk70.lataepat.com), a public explorer for Bangkok's fiscal-year 2570 budget.

Budget data becomes misleading when a child item is counted twice, a shared project is attributed entirely to one district, or an incomplete breakdown is drawn as a complete budget. These utilities address parts of that presentation and data-handling work.

This is the first standalone open-source release of code from an existing project. It is **not the full website or a government dataset**. Independent adoption, downloads, and external contributors have not been measured.

## What is included

| Utility | Behaviour |
| --- | --- |
| `allocationArcs` | Returns chart paths only when the parts reconcile to the supplied total within 0.01 units. |
| `mergeUniqueSearchRecords` | Combines area and detail views of the same scoped record without appending that detail again. |
| `indexCanonicalDistricts` | Retains the known district scope of canonical projects when a search filter hides some views. |
| `packBudgetJson` / `unpackBudgetJson` | Dictionary transport for repetitive JSON, preserving Thai strings and finite JSON numbers. |
| `districtMapScale` | Uses tied ranks consistently and keeps missing values distinct from known zero values. |
| `mapCameraViewBox` | Converts pan and zoom into a vector view box without stretching the map. |

There are no runtime dependencies, API keys, paid services, or build steps.

## Run locally

Use Node.js 22 or newer. From the extracted repository:

```sh
npm test
npm run example
npm run check:release
```

No `npm install` is needed to run those commands. To install into another local project, use `npm install /absolute/path/to/budgetbkk70-core`. This package has not been published to the npm registry.

```js
import { allocationArcs, packBudgetJson, unpackBudgetJson } from './src/index.mjs';

const parts = [
  { label: 'ถนนและทางเท้า', amount: 60 },
  { label: 'โรงเรียน', amount: 40 },
];

const arcs = allocationArcs(parts, 100);
console.log(arcs.map(({ label, share }) => ({ label, share })));

const transported = JSON.parse(JSON.stringify(packBudgetJson(parts)));
console.log(unpackBudgetJson(transported));
```

Browser consumers can import the ES modules directly. TypeScript declarations are included. See [API and input contracts](docs/API.md), [the data model](docs/DATA_MODEL.md), and [provenance](docs/PROVENANCE.md).

## Scope and limitations

- The associated source snapshot contains 50 district offices, 22 central budget units, and a register of 78 source documents. Those are **dataset coverage counts, not user counts**.
- Numeric values use JavaScript numbers. Use one currency and unit consistently, and keep integer minor-unit amounts within JavaScript's safe integer range.
- Record-merging inputs must already be unique within each input list. The utility does not validate source documents, establish project identity, or authorize summing area projections.
- Missing central-attribution evidence is not proof of zero spending in that district.
- JSON transport preserves strings exactly; it does not normalize Thai text. Non-JSON values are rejected. Negative zero is normalized to zero. Deeply nested or untrusted payloads need application-level size/depth limits.
- These functions do not certify the underlying budget's accuracy. Always retain source-page references and distinguish published figures from extracted or inferred fields.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Useful contributions include reproducible record-merging edge cases, Thai Unicode fixtures, and adapters for another municipality's documented budget structure. Use synthetic fixtures or legitimately public source material, and explain how each amount can be checked.

Maintained by **Thanapat Thiankrachang (Lataepat)**. The code was developed with AI assistance under the maintainer's direction. See [MAINTAINERS.md](MAINTAINERS.md) for the release process and [SECURITY.md](SECURITY.md) for reporting concerns.

## License

The software in this repository is available under the [MIT License](LICENSE). No font files, maps, photographs, government PDFs, private source history, or personal operational records are distributed here. The license does not grant rights to external websites or source datasets.
