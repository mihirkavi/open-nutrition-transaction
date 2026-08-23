"""Small dependency-free OpenNutri V1 decoder.

Use a Draft 2020-12 JSON Schema library with schema/event.schema.json for full
validation at production trust boundaries.
"""

from dataclasses import dataclass
from typing import Any

OPENNUTRI_VERSION = "1.0"
EVENT_TYPES = {"purchase", "refund", "partial_refund", "correction", "cancellation", "nutrition_update"}


@dataclass(frozen=True)
class ValidationResult:
    valid: bool
    errors: tuple[str, ...]


def validate_event(value: Any) -> ValidationResult:
    errors: list[str] = []
    if not isinstance(value, dict):
        return ValidationResult(False, ("event must be an object",))
    if value.get("schema_version") != OPENNUTRI_VERSION:
        errors.append(f"schema_version must be {OPENNUTRI_VERSION}")
    if value.get("event_type") not in EVENT_TYPES:
        errors.append("event_type is invalid")
    for field in ("event_id", "created_at"):
        if not isinstance(value.get(field), str) or not value[field].strip():
            errors.append(f"{field} must be a non-empty string")
    if not isinstance(value.get("transaction"), dict):
        errors.append("transaction must be an object")
    if not isinstance(value.get("merchant"), dict):
        errors.append("merchant must be an object")
    if not isinstance(value.get("items"), list):
        errors.append("items must be an array")
    if value.get("event_type") == "purchase" and not value.get("items"):
        errors.append("purchase events require at least one item")
    if value.get("event_type") in {"correction", "nutrition_update"} and not value.get("supersedes_event_id"):
        errors.append("correction and nutrition_update events require supersedes_event_id")
    return ValidationResult(not errors, tuple(errors))
