# ONIP-0002: OpenNutri User-Authorized Exchange

- Status: Final
- Authors: OpenNutri maintainers
- Created: 2026-08-22
- OpenNutri version: 1.0

## Summary

Adopt narrow OAuth scopes, explicit consent, REST and webhook delivery,
revocation, idempotency, replay protection, and optional Ed25519 signatures.

## Rationale

OpenNutri exports a person's nutrition rather than opening a customer database.
The protocol therefore binds each source, destination, field category, history
window, and delivery frequency to a user-visible authorization.
