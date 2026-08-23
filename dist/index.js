export const OPENNUTRI_VERSION = "1.0";
export const CANONICAL_NUTRIENT_KEYS = [
    "energy_kcal", "protein_g", "carbohydrate_g", "fat_g", "saturated_fat_g",
    "trans_fat_g", "fiber_g", "total_sugars_g", "added_sugars_g", "sodium_mg",
    "cholesterol_mg", "potassium_mg", "calcium_mg", "iron_mg", "vitamin_d_mcg",
];
const EVENT_TYPES = new Set(["purchase", "refund", "partial_refund", "correction", "cancellation", "nutrition_update"]);
const CHANNELS = new Set(["in_store", "delivery", "pickup", "drive_through", "online", "subscription", "other"]);
const BASES = new Set(["per_item", "per_serving", "per_100g", "per_100ml", "purchased_quantity", "custom"]);
const TRUST_LEVELS = new Set(["self_declared", "source_attributed", "verified"]);
const CONSUMPTION_STATES = new Set(["purchased", "consumption_unknown", "allocated", "consumed", "partially_consumed", "discarded", "shared"]);
const SOURCE_TYPES = new Set(["manufacturer", "retailer", "restaurant", "supplier", "laboratory", "government_database", "recipe_calculation", "application_estimate", "ai_estimate", "user_entered", "unknown"]);
export function validateOpenNutriEvent(value) {
    const errors = [];
    if (!record(value))
        return { valid: false, errors: ["event must be an object"] };
    if (value.schema_version !== OPENNUTRI_VERSION)
        errors.push(`schema_version must be ${OPENNUTRI_VERSION}`);
    if (!EVENT_TYPES.has(value.event_type))
        errors.push("event_type is invalid");
    required(value.event_id, "event_id", errors);
    dateTime(value.created_at, "created_at", errors);
    if (value.supersedes_event_id !== undefined)
        required(value.supersedes_event_id, "supersedes_event_id", errors);
    if ((value.event_type === "correction" || value.event_type === "nutrition_update") && !value.supersedes_event_id)
        errors.push("correction and nutrition_update events require supersedes_event_id");
    validateTransaction(value.transaction, errors);
    validateMerchant(value.merchant, errors);
    if (!CONSUMPTION_STATES.has(value.consumption_state))
        errors.push("consumption_state is invalid");
    if (!Array.isArray(value.items) || (value.event_type === "purchase" && value.items.length === 0))
        errors.push("purchase events require at least one item");
    else if (Array.isArray(value.items))
        value.items.forEach((item, index) => validateItem(item, `items[${index}]`, errors));
    if (!record(value.provenance))
        errors.push("provenance must be an object");
    else {
        required(value.provenance.generated_by, "provenance.generated_by", errors);
        if (!TRUST_LEVELS.has(value.provenance.trust_level))
            errors.push("provenance.trust_level is invalid");
    }
    if (value.signature !== undefined)
        validateSignature(value.signature, errors);
    return errors.length ? { valid: false, errors } : { valid: true, value: value };
}
function validateTransaction(value, errors) {
    if (!record(value))
        return void errors.push("transaction must be an object");
    required(value.transaction_id, "transaction.transaction_id", errors);
    if (value.purchased_at !== undefined)
        dateTime(value.purchased_at, "transaction.purchased_at", errors);
    if (value.currency !== undefined && (typeof value.currency !== "string" || !/^[A-Z]{3}$/.test(value.currency)))
        errors.push("transaction.currency must be a three-letter uppercase code");
    if (value.channel !== undefined && !CHANNELS.has(value.channel))
        errors.push("transaction.channel is invalid");
}
function validateMerchant(value, errors) {
    if (!record(value))
        return void errors.push("merchant must be an object");
    required(value.name, "merchant.name", errors);
    if (record(value.location) && (typeof value.location.country !== "string" || !/^[A-Z]{2}$/.test(value.location.country)))
        errors.push("merchant.location.country must be an uppercase ISO country code");
}
function validateItem(value, path, errors) {
    if (!record(value))
        return void errors.push(`${path} must be an object`);
    required(value.item_id, `${path}.item_id`, errors);
    required(value.name, `${path}.name`, errors);
    validateQuantity(value.quantity, `${path}.quantity`, errors);
    validateNutrition(value.nutrition, `${path}.nutrition`, errors);
    validateProvenance(value.provenance, `${path}.provenance`, errors);
    if (value.components !== undefined) {
        if (!Array.isArray(value.components))
            errors.push(`${path}.components must be an array`);
        else
            value.components.forEach((item, index) => validateItem(item, `${path}.components[${index}]`, errors));
    }
}
function validateQuantity(value, path, errors) {
    if (!record(value))
        return void errors.push(`${path} must be an object`);
    if (value.count === undefined && value.amount === undefined && value.net_weight === undefined)
        errors.push(`${path} must define count, amount, or net_weight`);
    if (value.count !== undefined && !positive(value.count))
        errors.push(`${path}.count must be positive`);
    if (value.amount !== undefined && !positive(value.amount))
        errors.push(`${path}.amount must be positive`);
    if (value.amount !== undefined)
        required(value.unit, `${path}.unit`, errors);
}
function validateNutrition(value, path, errors) {
    if (!record(value))
        return void errors.push(`${path} must be an object`);
    if (!BASES.has(value.basis))
        errors.push(`${path}.basis is invalid`);
    if (value.confidence !== undefined && (!finite(value.confidence) || value.confidence < 0 || value.confidence > 1))
        errors.push(`${path}.confidence must be between 0 and 1`);
    for (const [key, amount] of Object.entries(value)) {
        if (key === "basis" || key === "serving_size" || key === "confidence")
            continue;
        if (!CANONICAL_NUTRIENT_KEYS.includes(key))
            errors.push(`${path}.${key} is not a canonical nutrient`);
        else if (!nonnegative(amount))
            errors.push(`${path}.${key} must be a nonnegative finite number`);
    }
}
function validateProvenance(value, path, errors) {
    if (!record(value))
        return void errors.push(`${path} must be an object`);
    if (!SOURCE_TYPES.has(value.source_type))
        errors.push(`${path}.source_type is invalid`);
    required(value.source_name, `${path}.source_name`, errors);
    if (!TRUST_LEVELS.has(value.trust_level))
        errors.push(`${path}.trust_level is invalid`);
    for (const key of ["calculated_at", "valid_from"])
        if (value[key] !== undefined)
            dateTime(value[key], `${path}.${key}`, errors);
}
function validateSignature(value, errors) {
    if (!record(value))
        return void errors.push("signature must be an object");
    if (value.algorithm !== "Ed25519")
        errors.push("signature.algorithm must be Ed25519");
    required(value.key_id, "signature.key_id", errors);
    required(value.value, "signature.value", errors);
    dateTime(value.signed_at, "signature.signed_at", errors);
}
function required(value, path, errors) { if (typeof value !== "string" || !value.trim())
    errors.push(`${path} must be a non-empty string`); }
function dateTime(value, path, errors) { if (typeof value !== "string" || !value.includes("T") || Number.isNaN(Date.parse(value)))
    errors.push(`${path} must be an ISO 8601 date-time`); }
function record(value) { return typeof value === "object" && value !== null && !Array.isArray(value); }
function finite(value) { return typeof value === "number" && Number.isFinite(value); }
function nonnegative(value) { return finite(value) && value >= 0; }
function positive(value) { return finite(value) && value > 0; }
