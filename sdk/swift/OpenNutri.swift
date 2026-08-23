import Foundation

public enum OpenNutri {
    public static let version = "1.0"
}

public struct OpenNutriEvent: Codable, Sendable {
    public let schemaVersion: String
    public let eventType: EventType
    public let eventId: String
    public let createdAt: Date
    public let supersedesEventId: String?
    public let transaction: Transaction
    public let merchant: Merchant
    public let items: [Item]
    public let consumptionState: String

    enum CodingKeys: String, CodingKey {
        case schemaVersion = "schema_version"
        case eventType = "event_type"
        case eventId = "event_id"
        case createdAt = "created_at"
        case supersedesEventId = "supersedes_event_id"
        case transaction, merchant, items
        case consumptionState = "consumption_state"
    }

    public enum EventType: String, Codable, Sendable {
        case purchase, refund, partialRefund = "partial_refund", correction, cancellation, nutritionUpdate = "nutrition_update"
    }
    public struct Transaction: Codable, Sendable {
        public let transactionId: String
        public let purchasedAt: Date?
        public let timezone: String?
        public let currency: String?
        public let channel: String?
        enum CodingKeys: String, CodingKey { case transactionId = "transaction_id"; case purchasedAt = "purchased_at"; case timezone, currency, channel }
    }
    public struct Merchant: Codable, Sendable {
        public let merchantId: String?
        public let name: String
        public let locationId: String?
        enum CodingKeys: String, CodingKey { case merchantId = "merchant_id"; case name; case locationId = "location_id" }
    }
    public struct Item: Codable, Sendable {
        public let itemId: String
        public let name: String
        public let quantity: Quantity
        public let nutrition: [String: FlexibleValue]
        enum CodingKeys: String, CodingKey { case itemId = "item_id"; case name, quantity, nutrition }
    }
    public struct Quantity: Codable, Sendable {
        public let count: Double?
        public let amount: Double?
        public let unit: String?
    }
}

public enum FlexibleValue: Codable, Sendable {
    case string(String), number(Double)
    public init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()
        if let value = try? container.decode(Double.self) { self = .number(value); return }
        self = .string(try container.decode(String.self))
    }
    public func encode(to encoder: Encoder) throws {
        var container = encoder.singleValueContainer()
        switch self { case .string(let value): try container.encode(value); case .number(let value): try container.encode(value) }
    }
}
