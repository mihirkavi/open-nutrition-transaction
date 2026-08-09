export declare const OPEN_NUTRITION_TRANSACTION_VERSION: "0.1";
export declare const CANONICAL_NUTRIENT_KEYS: readonly ["energy_kcal", "protein_g", "carbohydrate_g", "total_fat_g", "saturated_fat_g", "trans_fat_g", "fiber_g", "total_sugars_g", "added_sugars_g", "sodium_mg", "cholesterol_mg"];
export type CanonicalNutrientKey = typeof CANONICAL_NUTRIENT_KEYS[number];
export type NutrientAmounts = Partial<Record<CanonicalNutrientKey, number>>;
export type NutritionRange = Partial<Record<CanonicalNutrientKey, {
    min: number;
    max: number;
}>>;
export type NutritionStatus = "verified" | "high_confidence" | "estimated" | "low_confidence" | "unresolved";
export type ConsumptionStatus = "purchased" | "assumed_consumed" | "user_confirmed_consumed" | "partially_consumed" | "shared" | "unknown";
export type SourceType = "restaurant_verified" | "restaurant_published" | "recipe_registry" | "usda_fdc" | "open_food_facts" | "external_recipe" | "ai_recipe_assumption";
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
    financial?: {
        unit_price: number;
        currency: string;
    };
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
export type ValidationResult = {
    valid: true;
    value: NutritionTransaction;
} | {
    valid: false;
    errors: string[];
};
export declare function validateNutritionTransaction(value: unknown): ValidationResult;
