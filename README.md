# OpenNutri

**Take your nutrition wherever you choose.**

[Visit the OpenNutri website](https://mihirkavi.github.io/open-nutrition-transaction/)

OpenNutri is an open interoperability standard for user-authorized nutrition
portability. It defines how food and nutrition information is represented, how
its origin and trust level are recorded, and how a person can authorize that
information to move between food businesses and nutrition or health services.

OpenNutri is designed to move nutrition—not a person's entire shopping profile.
A retailer can export the narrow nutritional representation of a customer's own
food purchase without exposing payment credentials, addresses, loyalty data,
browsing history, unrelated purchases, or proprietary systems.

## Why OpenNutri

If a company already knows the nutrition associated with food someone purchased,
that person should not have to manually type it into a health application again.
OpenNutri gives the ecosystem one neutral interface:

```text
food provider -> user-authorized OpenNutri event -> chosen application
```

- Consumers control the source, destination, fields, duration, history, and revocation.
- Retailers and POS providers integrate once instead of building a connector for every app.
- Nutrition applications receive structured, source-attributed data and compete on the experience above the standard.
- Dietitians and healthcare tools may receive better dietary context with the person's permission.

A purchase is not proof of consumption. OpenNutri preserves that distinction.

## The two specifications

- **OpenNutri Data** defines portable food events, item identity, quantity,
  nutrition basis, provenance, confidence, corrections, and historical validity.
- **OpenNutri Exchange** defines authorization scopes, consent, revocation,
  delivery, signatures, idempotency, and replay protection.

Start with [the Data specification](spec/data.md) and
[the Exchange specification](spec/exchange.md). The [core JSON Schema](schema/event.schema.json)
is the normative machine-readable contract.

## Quick start

Requires Node.js 22 or newer.

```sh
npm install
npm test
npm run demo
```

In another terminal:

```sh
curl http://localhost:8787/health
curl -H 'Authorization: Bearer demo-token' http://localhost:8787/v1/events
```

SDK usage:

```ts
import {
  OPENNUTRI_VERSION,
  validateOpenNutriEvent,
  type OpenNutriEvent,
} from "opennutri";
```

See [examples/grocery.json](examples/grocery.json) for a complete event and
[docs/quick-start.md](docs/quick-start.md) for delivery examples.

## Privacy and trust

Applications receive only the fields a person authorizes. OpenNutri supports
narrow scopes, one-time or continuing access, revocation, minimal retention,
source attribution, optional signatures, corrections, and idempotent delivery.
It never asks a retailer to expose its customer database.

Trust levels are explicit:

- `self_declared`: supplied by a user or application
- `source_attributed`: linked to a named source
- `verified`: cryptographically attributable to a source

Nutrition estimates are labeled. Values identify their basis—such as per item,
per serving, per 100 g, or the purchased quantity—so consumers do not need to guess.

## Project map

- [`MISSION.md`](MISSION.md), [`PRINCIPLES.md`](PRINCIPLES.md): purpose and boundaries
- [`spec/`](spec): Data, Exchange, provenance, authorization, and conformance
- [`schema/`](schema): composable JSON Schemas
- [`openapi/openapi.yaml`](openapi/openapi.yaml): REST reference API
- [`examples/`](examples): grocery, restaurant, refund, correction, and signed events
- [`sdk/`](sdk): TypeScript, Python, and Swift usage surfaces
- [`reference-server/`](reference-server): dependency-free example API
- [`demo/`](demo): merchant, consent, and receiving-app demonstrations
- [`docs/`](docs): implementation guides, diagrams, and adoption roadmap
- [`onips/`](onips): OpenNutri Improvement Proposal process

## Neutrality and scope

OpenNutri does not require a retailer to share data with ReceiptCal or any other
particular application. A person chooses the destination. ReceiptCal may be an
early reference consumer, while competing nutrition, dietitian, healthcare, and
research applications participate on equal terms.

OpenNutri V1 standardizes nutrition portability. It does not standardize medical
diagnosis, personalized treatment, universal food identity, payment data,
advertising profiles, or a centralized consumer database.

## Status and license

This repository contains the OpenNutri V1 foundation and reference tooling.
Implementations are responsible for applicable privacy, healthcare, consumer
protection, accessibility, and retention requirements; this project is not legal
or medical advice.

Licensed under Apache-2.0, including an explicit patent grant. See
[`GOVERNANCE.md`](GOVERNANCE.md) and [`CONTRIBUTING.md`](CONTRIBUTING.md) to participate.
