# Budget identity and attribution

The source application distinguishes a financial record from its appearances in search results and district views.

- `record_id`: identity of the underlying budget item.
- `view_id`: stable identity of the presentation or route.
- `district`: district context for this appearance.
- `canonical_view_id`: link back to the canonical presentation, when present.
- `related_districts`: all documented district links, before UI filtering.
- `view_role`: describes whether an appearance is canonical or an area projection.
- `parent_view_id`: a link to the containing budget heading or item.

The same project may appear in more than one district. Displaying it in each district does not create multiple independent budgets. Preserve the canonical identity and evidence before deciding what can be added together.

For the source project's map, office budget is separate from the central budget that can safely be assigned to one district. `minimum_verified_budget` is a conservative combination defined by the application, not an estimate of all public spending in the district. A record with incomplete place evidence must not silently become an exclusive district allocation.

The example included with this package uses synthetic amounts. It illustrates behaviour and is not a claim about Bangkok's actual budget.
