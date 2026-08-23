# OpenNutri JSON Schemas

`event.schema.json` is the V1 entry point. It references the transaction, item,
nutrition, and provenance resources by their canonical OpenNutri IDs. Register
all five local schema files with the validator before compiling the event schema;
this avoids network access and works from an npm archive or source checkout.

The canonical IDs point to this project's tagged repository location. They become
fetchable only after the corresponding OpenNutri release is published. Production
systems should pin a release, cache the schema set, and never fetch mutable schemas
during request processing.
