export declare const OPENNUTRI_VERSION: "1.0";
export declare const CANONICAL_NUTRIENT_KEYS: readonly ["energy_kcal", "protein_g", "carbohydrate_g", "fat_g", "saturated_fat_g", "trans_fat_g", "fiber_g", "total_sugars_g", "added_sugars_g", "sodium_mg", "cholesterol_mg", "potassium_mg", "calcium_mg", "iron_mg", "vitamin_d_mcg"];
export type CanonicalNutrientKey = typeof CANONICAL_NUTRIENT_KEYS[number];
export type NutrientAmounts = Partial<Record<CanonicalNutrientKey, number>>;
export type EventType = "purchase" | "refund" | "partial_refund" | "correction" | "cancellation" | "nutrition_update";
export type TransactionChannel = "in_store" | "delivery" | "pickup" | "drive_through" | "online" | "subscription" | "other";
export type NutritionBasis = "per_item" | "per_serving" | "per_100g" | "per_100ml" | "purchased_quantity" | "custom";
export type TrustLevel = "self_declared" | "source_attributed" | "verified";
export type ConsumptionState = "purchased" | "consumption_unknown" | "allocated" | "consumed" | "partially_consumed" | "discarded" | "shared";
export interface Quantity {
    count?: number;
    amount?: number;
    unit?: string;
    net_weight?: {
        amount: number;
        unit: string;
    };
}
export interface Nutrition extends NutrientAmounts {
    basis: NutritionBasis;
    serving_size?: {
        amount: number;
        unit: string;
    };
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
    modifiers?: Array<{
        type: "add" | "remove" | "substitute" | "size" | "preparation" | "topping" | "sauce" | "side";
        name: string;
        nutrition_delta?: NutrientAmounts;
    }>;
    components?: OpenNutriItem[];
    provenance: Provenance;
}
export interface OpenNutriEvent {
    schema_version: typeof OPENNUTRI_VERSION;
    event_type: EventType;
    event_id: string;
    created_at: string;
    supersedes_event_id?: string;
    transaction: {
        transaction_id: string;
        purchased_at?: string;
        timezone?: string;
        currency?: string;
        channel?: TransactionChannel;
    };
    merchant: {
        merchant_id?: string;
        name: string;
        location_id?: string;
        location?: {
            country: string;
            region?: string;
        };
    };
    items: OpenNutriItem[];
    consumption_state: ConsumptionState;
    provenance: {
        generated_by: string;
        trust_level: TrustLevel;
    };
    signature?: {
        algorithm: "Ed25519";
        key_id: string;
        value: string;
        signed_at: string;
    };
}
export type ValidationResult = {
    valid: true;
    value: OpenNutriEvent;
} | {
    valid: false;
    errors: string[];
};
export declare function validateOpenNutriEvent(value: unknown): ValidationResult;
