# OpenNutri Exchange V1

OpenNutri Exchange defines how a person authorizes OpenNutri events to move from
a source to a destination. The source remains responsible for authentication,
authorization, consent records, transport security, retention, and applicable law.

## Authorization flow

Use OAuth 2.1 authorization code flow with PKCE for connected applications.
Display the source, destination, fields, event window, frequency, and revocation
method before approval. Never ask a person to give a third party their retailer password.

Access tokens are short-lived, audience-bound, sender-constrained where practical,
and limited to approved scopes. Refresh tokens are rotated and revoked on reuse.

## Delivery

Sources may support REST retrieval, webhooks, a JSON download, a digital receipt
link, a QR-resolved record, or a file export. Every method delivers the same event
semantics. Receivers deduplicate by `event_id` and process corrections in order.

Webhook requests include a unique delivery ID, timestamp, event ID, and signature.
Receivers reject stale timestamps and previously accepted delivery IDs. Delivery
uses exponential backoff and stops after revocation.

## Revocation and deletion

Revocation stops future delivery and token use promptly. It does not silently
delete records already delivered. Consent UX explains whether the person may also
request deletion from source or destination and what legal retention exceptions apply.

See [`authorization.md`](authorization.md), [`../openapi/openapi.yaml`](../openapi/openapi.yaml),
and [`../docs/webhooks.md`](../docs/webhooks.md).
