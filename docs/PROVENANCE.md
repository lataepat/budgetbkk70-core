# Provenance and evidence boundaries

Prepared on 16 September 2026 from the BudgetBKK70 source snapshot at commit `b5afe1a29e1a176246c906a2448884482c43fbb4` (8 September 2026). The public project is [งบใกล้บ้าน](https://budgetbkk70.lataepat.com). The hosting record reported version 81 when inspected. Those versions belong to the source website; they are not GitHub releases.

The four modules originated in the website's `app/` directory. Allocation and map-model modules are copied unchanged. The extracted merge module uses tuple keys to avoid delimiter collisions. The extracted JSON packer adds rejection of non-JSON values and cycles. These package changes have not been deployed back to the source website.

Per-file source and release hashes are recorded in [provenance.json](provenance.json). Tests, type declarations, documentation, and synthetic examples were prepared for this standalone release. Private repository endpoints and source history are excluded.

The inspected source snapshot contains 50 district offices, 22 central budget units with budget totals, and 78 source-document register entries. It contains 23 central-source entries in total; one has no positive unit total, so the budget-unit count is 22. These counts describe coverage, not readership, adoption, contributors, or downloads.

The source data's public provenance points to the [Bangkok data portal](https://data.bangkok.go.th/). Repository tests check the extracted data's arithmetic and structure. They are not independent re-verification of every source PDF, a legal interpretation of source-data licensing, or proof of real-world impact. This repository does not redistribute the source dataset.

No GitHub stars, npm downloads, external contributors, press citations, or users are claimed. The package is a newly prepared release from a project with an existing deployment. No independent security audit has been performed.
