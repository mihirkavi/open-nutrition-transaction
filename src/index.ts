export const OPEN_NUTRITION_TRANSACTION_VERSION = "0.1" as const;

export const CANONICAL_NUTRIENT_KEYS = [
  "energy_kcal",
  "protein_g",
  "carbohydrate_g",
  "total_fat_g",
  "saturated_fat_g",
  "trans_fat_g",
  "fiber_g",
  "total_sugars_g",
  "added_sugars_g",
  "sodium_mg",
  "cholesterol_mg",
] as const;

export type CanonicalNutrientKey = typeof CANONICAL_NUTRIENT_KEYS[number];
export type NutrientAmounts = Partial<Record<CanonicalNutrientKey, number>>;
export type NutritionRange = Partial<Record<CanonicalNutrientKey, { min: number; max: number }>>;

export type NutritionStatus =
  | "verified"
  | "high_confidence"
  | "estimated"
  | "low_confidence"
  | "unresolved";

export type ConsumptionStatus =
  | "purchased"
  | "assumed_consumed"
  | "user_confirmed_consumed"
  | "partially_consumed"
  | "shared"
  | "unknown";

export type SourceType =
  | "restaurant_verified"
  | "restaurant_published"
  | "recipe_registry"
  | "usda_fdc"
  | "open_food_facts"
  | "external_recipe"
  | "ai_recipe_assumption";

export interface ProvenanceComponent {
  source_type: SourceType;
  source_id: string;
  source_name: string;
  source_url?: string;
  retrieved_at?: string;
  ingredient_name?: string;
  quantity_grams?: number;
  nutrient_values?: NutrientAmounts;
}

export interface NutritionTransactionItem {
  id: string;
  name: string;
  quantity: number;
  financial?: { unit_price: number; currency: string };
  nutrition: NutrientAmounts;
  nutrition_range?: NutritionRange;
  nutrition_status: NutritionStatus;
  confidence: number;
  source_method: string;
  recipe_version?: string;
  assumptions: string[];
  provenance: ProvenanceComponent[];
}

export interface NutritionTransaction {
  nutrition_transaction_version: typeof OPEN_NUTRITION_TRANSACTION_VERSION;
  transaction_id: string;
  merchant: {
    name: string;
    location_id?: string;
  };
  purchased_at?: string;
  consumption_status: ConsumptionStatus;
  currency: string;
  items: NutritionTransactionItem[];
  nutrition_total: NutrientAmounts;
  nutrition_total_range?: NutritionRange;
}

export type ValidationResult =
  | { valid: true; value: NutritionTransaction }
  | { valid: false; errors: string[] };

export function validateNutritionTransaction(value: unknown): ValidationResult {
  const errors: string[] = [];
  if (!isRecord(value)) return { valid: false, errors: ["transaction must be an object"] };
  if (value.nutrition_transaction_version !== OPEN_NUTRITION_TRANSACTION_VERSION) {
    errors.push(`nutrition_transaction_version must be ${OPEN_NUTRITION_TRANSACTION_VERSION}`);
  }
  requiredString(value.transaction_id, "transaction_id", errors);
  requiredString(value.currency, "currency", errors);
  if (!isRecord(value.merchant)) errors.push("merchant must be an object");
  else requiredString(value.merchant.name, "merchant.name", errors);
  if (!CONSUMPTION_STATUSES.has(value.consumption_status)) {
    errors.push("consumption_status is invalid");
  }
  if (!Array.isArray(value.items) || value.items.length === 0) {
    errors.push("items must contain at least one item");
  } else {
    value.items.forEach((item, index) => validateItem(item, index, errors));
  }
  validateNutrients(value.nutrition_total, "nutrition_total", errors);
  return errors.length === 0
    ? { valid: true, value: value as NutritionTransaction & Record<string, unknown> }
    : { valid: false, errors };
}

const CONSUMPTION_STATUSES = new Set<unknown>([
  "purchased", "assumed_consumed", "user_confirmed_consumed",
  "partially_consumed", "shared", "unknown",
]);
const NUTRITION_STATUSES = new Set<unknown>([
  "verified", "high_confidence", "estimated", "low_confidence", "unresolved",
]);
const SOURCE_TYPES = new Set<unknown>([
  "restaurant_verified", "restaurant_published", "recipe_registry", "usda_fdc",
  "open_food_facts", "external_recipe", "ai_recipe_assumption",
]);

function validateItem(value: unknown, index: number, errors: string[]): void {
  const path = `items[${index}]`;
  if (!isRecord(value)) {
    errors.push(`${path} must be an object`);
    return;
  }
  requiredString(value.id, `${path}.id`, errors);
  requiredString(value.name, `${path}.name`, errors);
  requiredString(value.source_method, `${path}.source_method`, errors);
  if (!positive(value.quantity)) errors.push(`${path}.quantity must be positive`);
  if (!unitInterval(value.confidence)) errors.push(`${path}.confidence must be between 0 and 1`);
  if (!NUTRITION_STATUSES.has(value.nutrition_status)) errors.push(`${path}.nutrition_status is invalid`);
  validateNutrients(value.nutrition, `${path}.nutrition`, errors);
  if (!Array.isArray(value.assumptions) || !value.assumptions.every(nonemptyString)) {
    errors.push(`${path}.assumptions must be an array of strings`);
  }
  if (!Array.isArray(value.provenance)) {
    errors.push(`${path}.provenance must be an array`);
  } else {
    value.provenance.forEach((component, componentIndex) => {
      const componentPath = `${path}.provenance[${componentIndex}]`;
      if (!isRecord(component)) {
        errors.push(`${componentPath} must be an object`);
        return;
      }
      if (!SOURCE_TYPES.has(component.source_type)) errors.push(`${componentPath}.source_type is invalid`);
      requiredString(component.source_id, `${componentPath}.source_id`, errors);
      requiredString(component.source_name, `${componentPath}.source_name`, errors);
    });
  }
}

function validateNutrients(value: unknown, path: string, errors: string[]): void {
  if (!isRecord(value)) {
    errors.push(`${path} must be an object`);
    return;
  }
  for (const [key, amount] of Object.entries(value)) {
    if (!CANONICAL_NUTRIENT_KEYS.includes(key as CanonicalNutrientKey)) {
      errors.push(`${path}.${key} is not a canonical nutrient`);
    } else if (!nonnegative(amount)) {
      errors.push(`${path}.${key} must be a nonnegative finite number`);
    }
  }
}

function requiredString(value: unknown, path: string, errors: string[]): void {
  if (!nonemptyString(value)) errors.push(`${path} must be a non-empty string`);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function nonemptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function nonnegative(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

function positive(value: unknown): value is number {
  return nonnegative(value) && value > 0;
}

function unitInterval(value: unknown): value is number {
  return nonnegative(value) && value <= 1;
}
