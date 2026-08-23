# OpenNutri Security

Do not open public issues containing receipts, dietary histories, credentials,
or other personal data. Report security concerns privately through GitHub's
security-advisory feature for this repository.

OpenNutri schemas are data-exchange contracts. Implementations remain responsible
for authentication, authorization, encryption in transit and at rest, secret and
key management, replay protection, retention, consent, revocation, and deletion.

Use OAuth authorization code with PKCE rather than collecting retailer passwords.
Keep tokens audience-bound, short-lived, and narrowly scoped. Verify webhook
timestamps, signatures, and unique delivery IDs before processing. Do not put
personal data in URLs, logs, demo payloads, test fixtures, or public issue reports.

OpenNutri is not automatically subject to or exempt from any particular legal
regime. Obligations depend on the implementation, parties, jurisdiction, and use.
