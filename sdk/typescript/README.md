# OpenNutri TypeScript SDK

The root package is the TypeScript SDK. It exports V1 types, canonical nutrient
keys, the current schema version, and a dependency-free runtime validator.

```ts
import { validateOpenNutriEvent } from "opennutri";

const result = validateOpenNutriEvent(payload);
if (!result.valid) throw new Error(result.errors.join("\n"));
```

The runtime validator enforces core semantics. Use the JSON Schema for complete
structural validation at trust boundaries.
