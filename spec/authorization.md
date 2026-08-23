# OpenNutri Authorization V1

V1 defines these independently grantable scopes:

- `events.read`: current authorized events
- `events.history`: historical events within the displayed time window
- `nutrition.read`: nutrition values, basis, and provenance
- `item_identity.read`: item name, identifiers, and quantity
- `merchant.read`: minimal merchant and location context
- `subscriptions.write`: create or revoke continuing delivery

An implementation may define narrower namespaced scopes. A broad scope must not
silently imply unrelated account, payment, address, loyalty, advertising,
browsing, or non-food purchase access.

Consent is specific, informed, freely chosen, and reversible. The approval screen
names the source and destination, summarizes each field category, distinguishes
one-time from continuing access, gives the history window, and provides a direct
revocation path. Preselected optional scopes and deceptive interfaces are prohibited.
