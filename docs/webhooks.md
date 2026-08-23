# OpenNutri Webhooks

Each delivery includes `OpenNutri-Delivery-Id`, `OpenNutri-Event-Id`,
`OpenNutri-Timestamp`, and `OpenNutri-Signature`. Sign the timestamp, delivery ID,
and exact body bytes. Receivers verify the signature against a pinned or
discovered key, reject timestamps outside a five-minute window, and reject reused
delivery IDs before parsing the event.

Return 2xx only after durable idempotent acceptance. Retry transient failures
with exponential backoff and jitter. Do not retry permanent 4xx failures except
429. Stop delivery immediately after revocation. Rotate keys with an overlap
window and stable key IDs. Ed25519 is the V1 signature algorithm.
