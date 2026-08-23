# ONIP-0001: OpenNutri Core Event Schema

- Status: Final
- Authors: OpenNutri maintainers
- Created: 2026-08-22
- OpenNutri version: 1.0

## Summary

Adopt the V1 event envelope, explicit quantities and nutrition basis, established
item identifiers, provenance, historical validity, correction lineage, and the
purchase-versus-consumption boundary in `schema/` and `spec/data.md`.

## Rationale

The smallest useful interoperable unit is a source-attributed food event. The
schema deliberately excludes payment, credential, address, loyalty, browsing,
and advertising data. Namespaced extensions support experiments without weakening
the portable core.
