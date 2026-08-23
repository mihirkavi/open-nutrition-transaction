# Application Developer Guide

Register a redirect URI, request only required scopes, use authorization code
with PKCE, and bind each authorization to the person who approved it. Do not ask
for retailer credentials or scrape private accounts.

On receipt, validate the schema version, event ID, event type, timestamps,
nutrition basis, provenance, and signature when present. Store event IDs for
idempotency. Apply corrections by lineage while retaining the audit trail.

Display whether nutrition is verified, source-attributed, estimated, or unknown.
Never transform `purchased` into `consumed` without a separate user or application
event. Preserve partial data and ask the person to review uncertainty rather than
inventing missing nutrition.

ReceiptCal, MyFitnessPal, Cronometer, Lose It!, dietitian systems, retailer apps,
health platforms, and future applications can implement the same interface.
OpenNutri compatibility does not imply endorsement by any listed product.
