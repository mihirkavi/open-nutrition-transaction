# POS Provider Guide

A POS provider can make OpenNutri an optional merchant capability across many
restaurants. Map menu and modifier IDs at the source, compute nutrition using the
merchant's authoritative recipe version, and generate an event after payment.

```text
restaurant -> POS -> user-authorized OpenNutri event -> chosen application
```

Keep merchant configuration and customer authorization separate. Support bundles,
additions, removals, substitutions, sizes, preparation choices, sauces, sides,
and source recipe validity. A digital receipt can offer a JSON download, link, or
QR record before a merchant adopts OAuth or webhooks.
