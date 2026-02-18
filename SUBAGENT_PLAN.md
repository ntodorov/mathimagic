# Parallel Subagent Execution Plan

Goal: enable 3-6 concurrent workstreams with minimal merge conflicts.

## Coordination rules
- Branch naming: `feat/<workstream>-<short-desc>`
- Keep each PR scoped to one workstream.
- Merge order guardrails:
  1. Generation/domain refactor first
  2. Feature layers depending on generation next
  3. UI polish/docs parallel where possible
- Shared contract doc: add `docs/ENGINE_CONTRACT.md` for data shapes used across streams.

---

## Workstream A — Math Engine & Difficulty Profiles (Foundation)

**Scope**
- Move equation generation out of `EquationList.js` into `src/domain/generation/`.
- Define operation profile config by `{operation, gradeBand, difficulty}`.
- Add deterministic unit tests for range validity and no-invalid-question guarantees.

**Primary files**
- New: `src/domain/generation/*`
- Touch: `src/EquationList.js`, `src/operations.js`, tests

**Dependencies**
- None (should start first).

**Merge conflict risk**
- Medium with other feature streams touching `EquationList.js`; minimize by quickly introducing stable APIs.

---

## Workstream B — Practice Setup UI (Selectors + Session Metadata)

**Scope**
- Add grade/difficulty controls in start screen.
- Lock controls during active session.
- Pass profile config into generation API.
- Persist `gradeBand` and `difficulty` in session records and history cards.

**Primary files**
- `src/App.js`, `src/useUsername.js` (or split hook), `src/operations.js`, tests

**Dependencies**
- Needs Workstream A generation API contract.

**Merge conflict risk**
- High with any broad `App.js` changes; mitigate via early component extraction (small preparatory PR).

---

## Workstream C — Review Experience Improvements

**Scope**
- Add mistake-focused review blocks (show only wrong/skipped first).
- Add explanation placeholder framework (`why this is correct`, `common mistake`).
- Keep fully read-only behavior and existing review safeguards.

**Primary files**
- `src/App.js` (review section), potential new `src/components/review/*`, tests

**Dependencies**
- Independent; can start in parallel with A/B if it avoids setup section edits.

**Merge conflict risk**
- Medium with `App.js`; lower if componentized in PR.

---

## Workstream D — Storage Schema & Migration Safety

**Scope**
- Introduce localStorage schema versioning utility.
- Add migration path for older sessions lacking new fields.
- Add defensive parsing and corruption fallback handling.

**Primary files**
- `src/useUsername.js` (or extracted storage module), tests

**Dependencies**
- Independent, but should merge before or alongside B.

**Merge conflict risk**
- Low to medium.

---

## Workstream E — Accessibility & Motion/Interaction Quality

**Scope**
- Reduced motion support for animated buttons/transitions.
- Focus ring consistency and keyboard navigation audit.
- Improve ARIA labels where needed and verify screen reader wording.

**Primary files**
- `src/index.css`, UI components, tests

**Dependencies**
- Independent.

**Merge conflict risk**
- Low.

---

## Suggested parallel schedule

### Sprint 1 (parallel)
- A (start immediately)
- D (in parallel)
- E (in parallel)

### Sprint 2 (parallel after A contract exists)
- B (depends on A)
- C (parallel with B)

### Sprint 3
- Integration hardening + docs updates + cleanup of any temporary compatibility code.

---

## First feature to implement next (concrete)

**Implement Workstream A + B slice: Difficulty + Grade-Aware Generation (v1).**

### Acceptance criteria (implementation-ready)
1. User can select `gradeBand` and `difficulty` before session start.
2. Session creation includes these fields and locks them while session is active.
3. Generated equation ranges reflect selected profile for each operation.
4. Session history/review displays selected profile metadata.
5. Migration path keeps pre-existing saved sessions readable.
6. Tests added/updated; `npm run test:ci` passes.
