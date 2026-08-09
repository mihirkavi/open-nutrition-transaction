# Open Nutrition Transaction

Open Nutrition Transaction is a small public format for attaching explainable
nutrition data to a food purchase. It lets a restaurant, point-of-sale system,
receipt processor, or health app exchange the same JSON without sharing its
private application code.

In simple terms: a normal receipt says what you bought and what it cost. This
format adds what nutrients were associated with each item, how confident that
answer is, and where every number came from.

## What is open here

- the versioned JSON format
- TypeScript types and a runtime validator
- an OpenAPI description
- non-branded examples

This repository does **not** contain ReceiptCal's app, receipt parser, matching
logic, recipe registry, provider credentials, customer data, or product
infrastructure. ReceiptCal is one implementation and consumer of the format.

## Why this exists

Nutrition attached to purchases should be portable and auditable. A consumer
should be able to distinguish restaurant-verified nutrition from a calculated
estimate. Every result therefore carries a status, confidence score,
assumptions, and provenance records.

## Install

```sh
npm install github:mihirkavi/open-nutrition-transaction#v0.1.0
```

```ts
import {
  OPEN_NUTRITION_TRANSACTION_VERSION,
  validateNutritionTransaction,
  type NutritionTransaction,
} from "open-nutrition-transaction";
```

The canonical schema is
[`schemas/v0.1/nutrition-transaction.schema.json`](schemas/v0.1/nutrition-transaction.schema.json).
See [`examples/estimated-meal.json`](examples/estimated-meal.json) for a complete
example.

## Accuracy rules

- Language models may identify foods or suggest recipe ingredients, but must
  not be the source of nutrient values or arithmetic.
- Nutrient values must trace to a named source and explicit calculation.
- Estimates must be labeled; low-confidence estimates should include ranges.
- `purchased` is not the same as `consumed`.

## Versioning

The protocol starts at `0.1`. Additive changes may remain within a minor
version. Breaking changes require a new protocol version and schema path.

## License

Apache License 2.0. It permits broad commercial and non-commercial use and
includes an explicit patent grant. Product names and trademarks are not
licensed.
