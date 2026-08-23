# OpenNutri Provenance V1

Provenance records who supplied nutrition, the source identifier, the method,
calculation time, historical validity, and trust level. It is first-class data,
not free-form explanatory text.

Source types include manufacturer, retailer, restaurant, supplier, laboratory,
government database, recipe calculation, application estimate, AI estimate,
user entered, and unknown. Estimates must never masquerade as official values.

Trust levels:

- `self_declared`: no external attribution is asserted.
- `source_attributed`: a named source and method are present.
- `verified`: the source is cryptographically attributable using the exchange signature profile.

`valid_from` and `valid_until` identify the nutrition that applied at purchase
time. A later recipe or label change becomes a `nutrition_update` or `correction`
event linked to the earlier event.
