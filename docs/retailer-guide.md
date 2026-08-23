# Implement OpenNutri Without Exposing Your Customer Database

Publish a purpose-built export boundary inside retailer-controlled infrastructure.
Resolve the authenticated customer's allowed transaction IDs, project only
authorized food item identity, quantity, nutrition, time, and minimal merchant
context, then serialize an OpenNutri event. Never proxy arbitrary customer queries.

1. Add an “Export nutrition” entry to the receipt or account experience.
2. Show the destination, exact field categories, history window, and frequency.
3. Issue a narrow authorization grant after explicit approval.
4. Map internal IDs to stable, non-guessable event and transaction IDs.
5. Deliver only the approved projection by API, webhook, download, link, or QR.
6. Record consent and delivery for audit without logging the nutrition payload.
7. Offer direct revocation and explain destination-side deletion separately.

Exclude payment details, credentials, addresses, browsing and recommendation
history, loyalty intelligence, unrelated purchases, internal analytics, and
proprietary pricing logic. The interface is an export of the person's nutrition,
not access to the retailer's customer database.
