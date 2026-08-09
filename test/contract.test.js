import assert from "node:assert/strict";
import test from "node:test";

import {
  OPEN_NUTRITION_TRANSACTION_VERSION,
  validateNutritionTransaction,
} from "../dist/index.js";

const validTransaction = {
  nutrition_transaction_version: OPEN_NUTRITION_TRANSACTION_VERSION,
  transaction_id: "txn_example",
  merchant: { name: "Example Restaurant" },
  consumption_status: "purchased",
  currency: "USD",
  items: [{
    id: "item_1",
    name: "Hummus",
    quantity: 1,
    nutrition: { energy_kcal: 180, protein_g: 6 },
    nutrition_status: "estimated",
    confidence: 0.72,
    source_method: "recipe_calculation",
    assumptions: ["Serving mass estimated at 100 g"],
    provenance: [{
      source_type: "usda_fdc",
      source_id: "fdc:123",
      source_name: "USDA FoodData Central",
    }],
  }],
  nutrition_total: { energy_kcal: 180, protein_g: 6 },
};

test("accepts a provenance-aware nutrition transaction", () => {
  assert.deepEqual(validateNutritionTransaction(validTransaction), {
    valid: true,
    value: validTransaction,
  });
});

test("rejects false precision and malformed confidence", () => {
  const invalid = structuredClone(validTransaction);
  invalid.items[0].confidence = 1.2;
  invalid.items[0].nutrition.made_up_nutrient = 10;
  const result = validateNutritionTransaction(invalid);
  assert.equal(result.valid, false);
  assert.match(result.errors.join("\n"), /confidence/);
  assert.match(result.errors.join("\n"), /canonical nutrient/);
});

test("rejects transactions without source records", () => {
  const invalid = structuredClone(validTransaction);
  delete invalid.items[0].provenance;
  const result = validateNutritionTransaction(invalid);
  assert.equal(result.valid, false);
  assert.match(result.errors.join("\n"), /provenance/);
});
