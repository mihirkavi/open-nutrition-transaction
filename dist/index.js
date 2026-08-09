export const OPEN_NUTRITION_TRANSACTION_VERSION = "0.1";
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
];
export function validateNutritionTransaction(value) {
    const errors = [];
    if (!isRecord(value))
        return { valid: false, errors: ["transaction must be an object"] };
    if (value.nutrition_transaction_version !== OPEN_NUTRITION_TRANSACTION_VERSION) {
        errors.push(`nutrition_transaction_version must be ${OPEN_NUTRITION_TRANSACTION_VERSION}`);
    }
    requiredString(value.transaction_id, "transaction_id", errors);
    if (typeof value.currency !== "string" || !/^[A-Z]{3}$/.test(value.currency)) {
        errors.push("currency must be a three-letter uppercase code");
    }
    if (!isRecord(value.merchant))
        errors.push("merchant must be an object");
    else
        requiredString(value.merchant.name, "merchant.name", errors);
    if (!CONSUMPTION_STATUSES.has(value.consumption_status)) {
        errors.push("consumption_status is invalid");
    }
    if (value.purchased_at !== undefined && !validDateTime(value.purchased_at)) {
        errors.push("purchased_at must be an ISO 8601 date-time");
    }
    if (!Array.isArray(value.items) || value.items.length === 0) {
        errors.push("items must contain at least one item");
    }
    else {
        value.items.forEach((item, index) => validateItem(item, index, errors));
    }
    validateNutrients(value.nutrition_total, "nutrition_total", errors);
    if (value.nutrition_total_range !== undefined) {
        validateRanges(value.nutrition_total_range, "nutrition_total_range", errors);
    }
    return errors.length === 0
        ? { valid: true, value: value }
        : { valid: false, errors };
}
const CONSUMPTION_STATUSES = new Set([
    "purchased", "assumed_consumed", "user_confirmed_consumed",
    "partially_consumed", "shared", "unknown",
]);
const NUTRITION_STATUSES = new Set([
    "verified", "high_confidence", "estimated", "low_confidence", "unresolved",
]);
const SOURCE_TYPES = new Set([
    "restaurant_verified", "restaurant_published", "recipe_registry", "usda_fdc",
    "open_food_facts", "external_recipe", "ai_recipe_assumption",
]);
function validateItem(value, index, errors) {
    const path = `items[${index}]`;
    if (!isRecord(value)) {
        errors.push(`${path} must be an object`);
        return;
    }
    requiredString(value.id, `${path}.id`, errors);
    requiredString(value.name, `${path}.name`, errors);
    requiredString(value.source_method, `${path}.source_method`, errors);
    if (!positive(value.quantity))
        errors.push(`${path}.quantity must be positive`);
    if (!unitInterval(value.confidence))
        errors.push(`${path}.confidence must be between 0 and 1`);
    if (!NUTRITION_STATUSES.has(value.nutrition_status))
        errors.push(`${path}.nutrition_status is invalid`);
    validateNutrients(value.nutrition, `${path}.nutrition`, errors);
    if (value.nutrition_range !== undefined)
        validateRanges(value.nutrition_range, `${path}.nutrition_range`, errors);
    if (value.financial !== undefined) {
        if (!isRecord(value.financial)
            || !nonnegative(value.financial.unit_price)
            || typeof value.financial.currency !== "string"
            || !/^[A-Z]{3}$/.test(value.financial.currency)) {
            errors.push(`${path}.financial must contain a nonnegative unit_price and uppercase currency`);
        }
    }
    if (!Array.isArray(value.assumptions) || !value.assumptions.every(nonemptyString)) {
        errors.push(`${path}.assumptions must be an array of strings`);
    }
    if (!Array.isArray(value.provenance)) {
        errors.push(`${path}.provenance must be an array`);
    }
    else {
        value.provenance.forEach((component, componentIndex) => {
            const componentPath = `${path}.provenance[${componentIndex}]`;
            if (!isRecord(component)) {
                errors.push(`${componentPath} must be an object`);
                return;
            }
            if (!SOURCE_TYPES.has(component.source_type))
                errors.push(`${componentPath}.source_type is invalid`);
            requiredString(component.source_id, `${componentPath}.source_id`, errors);
            requiredString(component.source_name, `${componentPath}.source_name`, errors);
            if (component.quantity_grams !== undefined && !positive(component.quantity_grams)) {
                errors.push(`${componentPath}.quantity_grams must be positive`);
            }
            if (component.retrieved_at !== undefined && !validDateTime(component.retrieved_at)) {
                errors.push(`${componentPath}.retrieved_at must be an ISO 8601 date-time`);
            }
            if (component.nutrient_values !== undefined) {
                validateNutrients(component.nutrient_values, `${componentPath}.nutrient_values`, errors);
            }
        });
    }
}
function validateRanges(value, path, errors) {
    if (!isRecord(value)) {
        errors.push(`${path} must be an object`);
        return;
    }
    for (const [key, range] of Object.entries(value)) {
        if (!CANONICAL_NUTRIENT_KEYS.includes(key)) {
            errors.push(`${path}.${key} is not a canonical nutrient`);
        }
        else if (!isRecord(range) || !nonnegative(range.min) || !nonnegative(range.max) || range.min > range.max) {
            errors.push(`${path}.${key} must contain nonnegative min and max with min at most max`);
        }
    }
}
function validateNutrients(value, path, errors) {
    if (!isRecord(value)) {
        errors.push(`${path} must be an object`);
        return;
    }
    for (const [key, amount] of Object.entries(value)) {
        if (!CANONICAL_NUTRIENT_KEYS.includes(key)) {
            errors.push(`${path}.${key} is not a canonical nutrient`);
        }
        else if (!nonnegative(amount)) {
            errors.push(`${path}.${key} must be a nonnegative finite number`);
        }
    }
}
function requiredString(value, path, errors) {
    if (!nonemptyString(value))
        errors.push(`${path} must be a non-empty string`);
}
function isRecord(value) {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}
function nonemptyString(value) {
    return typeof value === "string" && value.trim().length > 0;
}
function nonnegative(value) {
    return typeof value === "number" && Number.isFinite(value) && value >= 0;
}
function positive(value) {
    return nonnegative(value) && value > 0;
}
function unitInterval(value) {
    return nonnegative(value) && value <= 1;
}
function validDateTime(value) {
    return typeof value === "string" && value.includes("T") && !Number.isNaN(Date.parse(value));
}
