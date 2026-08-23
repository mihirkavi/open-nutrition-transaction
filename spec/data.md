# OpenNutri Data V1

OpenNutri Data defines the portable representation of a food event. The normative
machine contract is [`../schema/event.schema.json`](../schema/event.schema.json).

## Event envelope

Every event identifies its schema version, type, unique ID, creation time,
transaction, merchant, items, consumption state, and event-level provenance.
Supported V1 types are `purchase`, `refund`, `partial_refund`, `correction`,
`cancellation`, and `nutrition_update`. Processing is idempotent by `event_id`.

Corrections and nutrition updates reference the prior event with
`supersedes_event_id`. Implementations retain the history rather than silently
mutating already-delivered facts.

## Items and identity

Items may carry established identifiers: GTIN, UPC, EAN, PLU, merchant SKU,
menu item ID, or POS item ID. None is universally required, because restaurant
meals and prepared foods may lack global identity. Bundles use nested `components`.

Quantity is explicit: a count, an amount plus unit, or a count with net weight.
Implementations must not infer a missing unit.

## Nutrition

Nutrition declares its basis: `per_item`, `per_serving`, `per_100g`, `per_100ml`,
`purchased_quantity`, or `custom`. A serving basis includes a serving size.
Canonical field names encode units. Additional nutrients require a future
compatible schema change or a namespaced extension.

Confidence is used only for estimates and ranges from 0 to 1. It represents
estimation uncertainty, not an arbitrary overall quality score. Authoritative
manufacturer or restaurant values need not supply confidence.

## Purchase is not consumption

A merchant-originated purchase uses `purchased` or `consumption_unknown`. It must
not claim that a specific person ate the food. Downstream applications may record
allocation, consumption, partial consumption, discarding, or sharing with an
appropriate source and permission boundary.

## Internationalization

Currencies use ISO 4217 codes and countries use ISO 3166-1 alpha-2 codes.
Machine-readable units remain canonical while names and display content may be localized.
