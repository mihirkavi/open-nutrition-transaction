import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { OPENNUTRI_VERSION, validateOpenNutriEvent } from "../dist/index.js";

const validEvent = {
  schema_version: OPENNUTRI_VERSION,
  event_type: "purchase",
  event_id: "evt_test",
  created_at: "2026-08-22T18:00:00Z",
  transaction: { transaction_id: "txn_test", purchased_at: "2026-08-22T17:59:00Z", currency: "USD", channel: "in_store" },
  merchant: { merchant_id: "merchant_test", name: "Example Market", location: { country: "US", region: "CA" } },
  items: [{
    item_id: "line_1",
    name: "Hummus",
    quantity: { amount: 100, unit: "g" },
    nutrition: { basis: "purchased_quantity", energy_kcal: 182, protein_g: 7.9, confidence: 0.72 },
    provenance: { source_type: "government_database", source_id: "fdc:example", source_name: "USDA FoodData Central", method: "recipe_calculation", trust_level: "source_attributed" },
  }],
  consumption_state: "purchased",
  provenance: { generated_by: "Example Market export", trust_level: "source_attributed" },
};

test("accepts a complete OpenNutri purchase event", () => {
  assert.deepEqual(validateOpenNutriEvent(validEvent), { valid: true, value: validEvent });
});

test("accepts a minimal cancellation without claiming consumption", () => {
  const event = structuredClone(validEvent);
  event.event_type = "cancellation";
  event.items = [];
  event.consumption_state = "consumption_unknown";
  assert.equal(validateOpenNutriEvent(event).valid, true);
});

test("rejects missing fields, ambiguous quantities, and unknown nutrient units", () => {
  const event = structuredClone(validEvent);
  delete event.event_id;
  event.items[0].quantity = {};
  event.items[0].nutrition.calories = 182;
  const result = validateOpenNutriEvent(event);
  assert.equal(result.valid, false);
  assert.match(result.errors.join("\n"), /event_id/);
  assert.match(result.errors.join("\n"), /must define count, amount, or net_weight/);
  assert.match(result.errors.join("\n"), /canonical nutrient/);
});

test("rejects false precision and malformed metadata", () => {
  const event = structuredClone(validEvent);
  event.items[0].nutrition.confidence = 1.2;
  event.transaction.currency = "usd";
  event.created_at = "not-a-date";
  const result = validateOpenNutriEvent(event);
  assert.equal(result.valid, false);
  assert.match(result.errors.join("\n"), /confidence/);
  assert.match(result.errors.join("\n"), /currency/);
  assert.match(result.errors.join("\n"), /created_at/);
});

test("requires correction lineage", () => {
  const event = structuredClone(validEvent);
  event.event_type = "correction";
  const result = validateOpenNutriEvent(event);
  assert.equal(result.valid, false);
  assert.match(result.errors.join("\n"), /supersedes_event_id/);
});

test("accepts forward-compatible namespaced extensions", () => {
  const event = structuredClone(validEvent);
  event.extensions = { "org.example.member_id": "redacted-demo" };
  event.items[0].extensions = { "org.example.aisle": "prepared-foods" };
  assert.equal(validateOpenNutriEvent(event).valid, true);
});

for (const name of ["grocery", "restaurant", "refund", "correction", "signed-event"]) {
  test(`validates the ${name} example`, async () => {
    const raw = await readFile(new URL(`../examples/${name}.json`, import.meta.url), "utf8");
    const result = validateOpenNutriEvent(JSON.parse(raw));
    assert.equal(result.valid, true, result.valid ? "" : result.errors.join("\n"));
  });
}

test("all JSON Schemas parse and carry OpenNutri titles", async () => {
  for (const name of ["event", "transaction", "item", "nutrition", "provenance"]) {
    const raw = await readFile(new URL(`../schema/${name}.schema.json`, import.meta.url), "utf8");
    const schema = JSON.parse(raw);
    assert.match(schema.title, /^OpenNutri /);
  }
});
