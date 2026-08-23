import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

import { validateOpenNutriEvent } from "../dist/index.js";

const port = Number(process.env.PORT ?? 8787);
const exampleUrl = new URL("../examples/grocery.json", import.meta.url);
const event = JSON.parse(await readFile(exampleUrl, "utf8"));
const validation = validateOpenNutriEvent(event);
if (!validation.valid) throw new Error(validation.errors.join("\n"));

const subscriptions = new Map();

const server = createServer(async (request, response) => {
  const url = new URL(request.url ?? "/", `http://${request.headers.host ?? "localhost"}`);
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.setHeader("Cache-Control", "no-store");

  if (request.method === "GET" && url.pathname === "/health") {
    return send(response, 200, { ok: true, service: "OpenNutri reference server", version: "1.0" });
  }
  if (!authorized(request)) return send(response, 401, { error: "invalid_token" });

  if (request.method === "GET" && url.pathname === "/v1/events") {
    return send(response, 200, { events: [event], next_cursor: null });
  }
  if (request.method === "GET" && url.pathname === `/v1/events/${event.event_id}`) {
    return send(response, 200, event);
  }
  if (request.method === "POST" && url.pathname === "/v1/subscriptions") {
    const body = await readJson(request);
    if (!body || typeof body.destination_url !== "string" || !Array.isArray(body.event_types)) {
      return send(response, 400, { error: "invalid_subscription" });
    }
    let destination;
    try { destination = new URL(body.destination_url); } catch { return send(response, 400, { error: "invalid_destination" }); }
    if (destination.protocol !== "https:") return send(response, 400, { error: "https_required" });
    const subscriptionId = `sub_${crypto.randomUUID()}`;
    subscriptions.set(subscriptionId, { destination_url: destination.href, event_types: body.event_types });
    return send(response, 201, { subscription_id: subscriptionId, status: "active" });
  }
  if (request.method === "DELETE" && url.pathname.startsWith("/v1/subscriptions/")) {
    const subscriptionId = url.pathname.slice("/v1/subscriptions/".length);
    if (!subscriptions.delete(subscriptionId)) return send(response, 404, { error: "not_found" });
    response.writeHead(204); return response.end();
  }
  return send(response, 404, { error: "not_found" });
});

server.listen(port, "127.0.0.1", () => {
  process.stdout.write(`OpenNutri reference server: http://127.0.0.1:${port}\n`);
  process.stdout.write("Local demo token: demo-token\n");
});

function authorized(request) { return request.headers.authorization === "Bearer demo-token"; }
function send(response, status, body) { response.writeHead(status); response.end(JSON.stringify(body, null, 2)); }
async function readJson(request) {
  const chunks = [];
  for await (const chunk of request) {
    chunks.push(chunk);
    if (chunks.reduce((size, value) => size + value.length, 0) > 64_000) return null;
  }
  try { return JSON.parse(Buffer.concat(chunks).toString("utf8")); } catch { return null; }
}

export const referenceServerPath = fileURLToPath(import.meta.url);
