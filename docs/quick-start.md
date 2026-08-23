# OpenNutri Quick Start

Run `npm install`, `npm test`, then `npm run demo`. The local reference server
starts on port 8787 and exposes a health check plus an in-memory event feed.

```sh
curl http://localhost:8787/health
curl -H 'Authorization: Bearer demo-token' http://localhost:8787/v1/events
curl -H 'Authorization: Bearer demo-token' http://localhost:8787/v1/events/evt_grocery_001
```

The token exists only for local demonstration. Production implementations use
OAuth 2.1 authorization code with PKCE, narrow scopes, TLS, consent records,
short-lived access tokens, rotating refresh tokens, and prompt revocation.

Validate an event in TypeScript with `validateOpenNutriEvent`. Other languages
can validate against `schema/event.schema.json` and follow the semantic rules in `spec/`.
