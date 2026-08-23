export const OPENNUTRI_VERSION = "1.0" as const;

export const CANONICAL_NUTRIENT_KEYS = [
  "energy_kcal", "protein_g", "carbohydrate_g", "fat_g", "saturated_fat_g",
  "trans_fat_g", "fiber_g", "total_sugars_g", "added_sugars_g", "sodium_mg",
  "cholesterol_mg", "potassium_mg", "calcium_mg", "iron_mg", "vitamin_d_mcg",
] as const;

export type CanonicalNutrientKey = typeof CANONICAL_NUTRIENT_KEYS[number];
export type NutrientAmounts = Partial<Record<CanonicalNutrientKey, number>>;
export type EventType = "purchase" | "refund" | "partial_refund" | "correction" | "cancellation" | "nutrition_update";
export type TransactionChannel = "in_store" | "delivery" | "pickup" | "drive_through" | "online" | "subscription" | "other";
export type NutritionBasis = "per_item" | "per_serving" | "per_100g" | "per_100ml" | "purchased_quantity" | "custom";
export type TrustLevel = "self_declared" | "source_attributed" | "verified";
export type ConsumptionState = "purchased" | "consumption_unknown" | "allocated" | "consumed" | "partially_consumed" | "discarded" | "shared";

export interface Quantity { count?: number; amount?: number; unit?: string; net_weight?: { amount: number; unit: string } }
export interface Nutrition extends NutrientAmounts {
  basis: NutritionBasis;
  serving_size?: { amount: number; unit: string };
  confidence?: number;
}
export interface Provenance {
  source_type: "manufacturer" | "retailer" | "restaurant" | "supplier" | "laboratory" | "government_database" | "recipe_calculation" | "application_estimate" | "ai_estimate" | "user_entered" | "unknown";
  source_id?: string;
  source_name: string;
  source_url?: string;
  method?: string;
  calculated_at?: string;
  valid_from?: string;
  valid_until?: string | null;
  trust_level: TrustLevel;
}
export interface OpenNutriItem {
  item_id: string;
  name: string;
  quantity: Quantity;
  identifiers?: Partial<Record<"gtin" | "upc" | "ean" | "plu" | "merchant_sku" | "menu_item_id" | "pos_item_id", string>>;
  nutrition: Nutrition;
  ingredients?: string[];
  allergens?: string[];
  modifiers?: Array<{ type: "add" | "remove" | "substitute" | "size" | "preparation" | "topping" | "sauce" | "side"; name: string; nutrition_delta?: NutrientAmounts }>;
  components?: OpenNutriItem[];
  provenance: Provenance;
}
export interface OpenNutriEvent {
  schema_version: typeof OPENNUTRI_VERSION;
  event_type: EventType;
  event_id: string;
  created_at: string;
  supersedes_event_id?: string;
  transaction: { transaction_id: string; purchased_at?: string; timezone?: string; currency?: string; channel?: TransactionChannel };
  merchant: { merchant_id?: string; name: string; location_id?: string; location?: { country: string; region?: string } };
  items: OpenNutriItem[];
  consumption_state: ConsumptionState;
  provenance: { generated_by: string; trust_level: TrustLevel };
  signature?: { algorithm: "Ed25519"; key_id: string; value: string; signed_at: string };
}
export type ValidationResult = { valid: true; value: OpenNutriEvent } | { valid: false; errors: string[] };

const EVENT_TYPES = new Set(["purchase", "refund", "partial_refund", "correction", "cancellation", "nutrition_update"]);
const CHANNELS = new Set(["in_store", "delivery", "pickup", "drive_through", "online", "subscription", "other"]);
const BASES = new Set(["per_item", "per_serving", "per_100g", "per_100ml", "purchased_quantity", "custom"]);
const TRUST_LEVELS = new Set(["self_declared", "source_attributed", "verified"]);
const CONSUMPTION_STATES = new Set(["purchased", "consumption_unknown", "allocated", "consumed", "partially_consumed", "discarded", "shared"]);
const SOURCE_TYPES = new Set(["manufacturer", "retailer", "restaurant", "supplier", "laboratory", "government_database", "recipe_calculation", "application_estimate", "ai_estimate", "user_entered", "unknown"]);

export function validateOpenNutriEvent(value: unknown): ValidationResult {
  const errors: string[] = [];
  if (!record(value)) return { valid: false, errors: ["event must be an object"] };
  if (value.schema_version !== OPENNUTRI_VERSION) errors.push(`schema_version must be ${OPENNUTRI_VERSION}`);
  if (!EVENT_TYPES.has(value.event_type as string)) errors.push("event_type is invalid");
  required(value.event_id, "event_id", errors);
  dateTime(value.created_at, "created_at", errors);
  if (value.supersedes_event_id !== undefined) required(value.supersedes_event_id, "supersedes_event_id", errors);
  if ((value.event_type === "correction" || value.event_type === "nutrition_update") && !value.supersedes_event_id) errors.push("correction and nutrition_update events require supersedes_event_id");
  validateTransaction(value.transaction, errors);
  validateMerchant(value.merchant, errors);
  if (!CONSUMPTION_STATES.has(value.consumption_state as string)) errors.push("consumption_state is invalid");
  if (!Array.isArray(value.items) || (value.event_type === "purchase" && value.items.length === 0)) errors.push("purchase events require at least one item");
  else if (Array.isArray(value.items)) value.items.forEach((item, index) => validateItem(item, `items[${index}]`, errors));
  if (!record(value.provenance)) errors.push("provenance must be an object");
  else {
    required(value.provenance.generated_by, "provenance.generated_by", errors);
    if (!TRUST_LEVELS.has(value.provenance.trust_level as string)) errors.push("provenance.trust_level is invalid");
  }
  if (value.signature !== undefined) validateSignature(value.signature, errors);
  return errors.length ? { valid: false, errors } : { valid: true, value: value as unknown as OpenNutriEvent };
}

function validateTransaction(value: unknown, errors: string[]): void {
  if (!record(value)) return void errors.push("transaction must be an object");
  required(value.transaction_id, "transaction.transaction_id", errors);
  if (value.purchased_at !== undefined) dateTime(value.purchased_at, "transaction.purchased_at", errors);
  if (value.currency !== undefined && (typeof value.currency !== "string" || !/^[A-Z]{3}$/.test(value.currency))) errors.push("transaction.currency must be a three-letter uppercase code");
  if (value.channel !== undefined && !CHANNELS.has(value.channel as string)) errors.push("transaction.channel is invalid");
}
function validateMerchant(value: unknown, errors: string[]): void {
  if (!record(value)) return void errors.push("merchant must be an object");
  required(value.name, "merchant.name", errors);
  if (record(value.location) && (typeof value.location.country !== "string" || !/^[A-Z]{2}$/.test(value.location.country))) errors.push("merchant.location.country must be an uppercase ISO country code");
}
function validateItem(value: unknown, path: string, errors: string[]): void {
  if (!record(value)) return void errors.push(`${path} must be an object`);
  required(value.item_id, `${path}.item_id`, errors);
  required(value.name, `${path}.name`, errors);
  validateQuantity(value.quantity, `${path}.quantity`, errors);
  validateNutrition(value.nutrition, `${path}.nutrition`, errors);
  validateProvenance(value.provenance, `${path}.provenance`, errors);
  if (value.components !== undefined) {
    if (!Array.isArray(value.components)) errors.push(`${path}.components must be an array`);
    else value.components.forEach((item, index) => validateItem(item, `${path}.components[${index}]`, errors));
  }
}
function validateQuantity(value: unknown, path: string, errors: string[]): void {
  if (!record(value)) return void errors.push(`${path} must be an object`);
  if (value.count === undefined && value.amount === undefined && value.net_weight === undefined) errors.push(`${path} must define count, amount, or net_weight`);
  if (value.count !== undefined && !positive(value.count)) errors.push(`${path}.count must be positive`);
  if (value.amount !== undefined && !positive(value.amount)) errors.push(`${path}.amount must be positive`);
  if (value.amount !== undefined) required(value.unit, `${path}.unit`, errors);
}
function validateNutrition(value: unknown, path: string, errors: string[]): void {
  if (!record(value)) return void errors.push(`${path} must be an object`);
  if (!BASES.has(value.basis as string)) errors.push(`${path}.basis is invalid`);
  if (value.confidence !== undefined && (!finite(value.confidence) || value.confidence < 0 || value.confidence > 1)) errors.push(`${path}.confidence must be between 0 and 1`);
  for (const [key, amount] of Object.entries(value)) {
    if (key === "basis" || key === "serving_size" || key === "confidence") continue;
    if (!CANONICAL_NUTRIENT_KEYS.includes(key as CanonicalNutrientKey)) errors.push(`${path}.${key} is not a canonical nutrient`);
    else if (!nonnegative(amount)) errors.push(`${path}.${key} must be a nonnegative finite number`);
  }
}
function validateProvenance(value: unknown, path: string, errors: string[]): void {
  if (!record(value)) return void errors.push(`${path} must be an object`);
  if (!SOURCE_TYPES.has(value.source_type as string)) errors.push(`${path}.source_type is invalid`);
  required(value.source_name, `${path}.source_name`, errors);
  if (!TRUST_LEVELS.has(value.trust_level as string)) errors.push(`${path}.trust_level is invalid`);
  for (const key of ["calculated_at", "valid_from"] as const) if (value[key] !== undefined) dateTime(value[key], `${path}.${key}`, errors);
}
function validateSignature(value: unknown, errors: string[]): void {
  if (!record(value)) return void errors.push("signature must be an object");
  if (value.algorithm !== "Ed25519") errors.push("signature.algorithm must be Ed25519");
  required(value.key_id, "signature.key_id", errors);
  required(value.value, "signature.value", errors);
  dateTime(value.signed_at, "signature.signed_at", errors);
}
function required(value: unknown, path: string, errors: string[]): void { if (typeof value !== "string" || !value.trim()) errors.push(`${path} must be a non-empty string`); }
function dateTime(value: unknown, path: string, errors: string[]): void { if (typeof value !== "string" || !value.includes("T") || Number.isNaN(Date.parse(value))) errors.push(`${path} must be an ISO 8601 date-time`); }
function record(value: unknown): value is Record<string, unknown> { return typeof value === "object" && value !== null && !Array.isArray(value); }
function finite(value: unknown): value is number { return typeof value === "number" && Number.isFinite(value); }
function nonnegative(value: unknown): value is number { return finite(value) && value >= 0; }
function positive(value: unknown): value is number { return finite(value) && value > 0; }
