# Storage schema & migration strategy

## Where schema versions are defined

- `src/storageSchema.js`
  - `STORAGE_SCHEMA_VERSION` is the canonical schema version for persisted results/session payloads.
  - Versioned payload format:

```json
{
  "version": 1,
  "data": { "...": "..." }
}
```

- Keys covered by versioned storage:
  - `mathimagic_results`
  - `mathimagic_sessions`

## Read/write contract

- Use only these helpers for results/session persistence:
  - `readResults()`, `writeResults(results)`
  - `readSessions()`, `writeSessions(sessions)`
- `read*` helpers:
  1. Parse safely (no throw on invalid JSON)
  2. Detect legacy (unversioned) payloads and migrate
  3. Normalize missing/invalid fields
  4. Persist back in current version envelope
- `write*` helpers always write current version envelope with normalized data.

## How to add future migrations

1. Bump `STORAGE_SCHEMA_VERSION`.
2. Add explicit per-version migration steps in `migrateVersionedValue(...)`.
   - Example pattern: for version 1 -> 2, transform `data` shape and then normalize.
3. Keep `migrateLegacyValue(...)` for pre-version payloads.
4. Add tests in `src/storageSchema.test.js` for:
   - old version -> new version migration
   - corruption fallback
   - write/read roundtrip at current version

## Safety behavior

- Corrupted payloads (invalid JSON, wrong top-level type) fall back to safe defaults.
- Sanitization coerces invalid numeric fields to `0` and missing collection fields to `[]`.
- Successful reads rewrite storage in current version so migration is one-way and self-healing.
