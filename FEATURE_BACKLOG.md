# Mathimagic Feature Backlog (Prioritized)

Scoring legend:
- **Effort:** S (1-2 days), M (3-7 days), L (1-3 weeks), XL (multi-sprint)
- **Risk:** Low / Medium / High

## Quick Wins (small effort, high impact)

| Priority | Feature | Rationale | Effort | Risk | Suggested Order |
|---|---|---|---|---|---|
| QW-1 | Division Bridge mode (remainders + sharing stories) | Natural transition after division; establishes conceptual base for fractions. | M | Low | 1 |
| QW-2 | Fractions-as-Division mode (symbolic + visual) | Introduces next curriculum concept with direct prior-knowledge mapping. | M | Medium | 2 |
| QW-3 | Fraction comparison/equivalence drills | Builds number sense before operations with fractions. | M | Medium | 3 |
| QW-4 | Decimals bridge (tenths/hundredths + money) | Connects fractions to real-world use cases; high learner relevance. | M | Medium | 4 |
| QW-5 | Local storage schema version + migration helper | Future-proofs curriculum state and phase unlock tracking. | S | Medium | 5 |

## Medium Projects

| Priority | Feature | Rationale | Effort | Risk | Suggested Order |
|---|---|---|---|---|---|
| MP-1 | Mistake review with explanation cards | Converts practice app into learning app; helps users understand why answers are wrong. | L | Medium | 6 |
| MP-2 | Adaptive practice (weak-fact weighting) | Increases effectiveness by focusing on errors and low-confidence facts. | L | Medium | 7 |
| MP-3 | Component refactor (`App.js` + `EquationList.js` split into domain/ui hooks) | Current large files are maintainability bottlenecks; lowers merge conflicts and bug surface. | L | Medium | 8 |
| MP-4 | Daily goal + streak engine (real logic, not display-only) | Supports retention and habit-building; complements progress section. | M | Medium | 9 |
| MP-5 | Mixed Mastery challenge sets (ops + fractions + decimals) | Reinforces transfer and fluency across concepts, not isolated drills. | L | Medium | 10 |

## Long-Term / High-Impact Projects

| Priority | Feature | Rationale | Effort | Risk | Suggested Order |
|---|---|---|---|---|---|
| LP-1 | Parent/teacher insights dashboard (weak areas, trend over time) | Major educational value; enables targeted support beyond single sessions. | XL | High | 11 |
| LP-2 | Offline-first architecture (service worker + cache strategy + recovery UX) | Improves reliability in low-connectivity environments common on mobile/tablets. | L | Medium | 12 |
| LP-3 | Cloud sync + export/import profiles | Device portability and backup; prerequisite for multi-device household usage. | XL | High | 13 |
| LP-4 | Guided curriculum tracks (skills map + progression unlocks) | Strong long-term retention and pedagogy impact; turns app into structured learning journey. | XL | High | 14 |
| LP-5 | Internationalization (copy + number formatting + locale-aware UX) | Expands audience and maintainability for content changes. | L | Medium | 15 |

---

## Dependencies and sequencing notes

1. **Do first:** QW-1 (Division Bridge) before fraction/decimal features.
2. **Before persistent progression:** QW-5 (schema versioning) to avoid migration debt.
3. **Before adaptive engine:** QW-1 through QW-4 should land first to establish curriculum metadata and review pipeline.
4. **Before dashboard/sync:** MP-3 refactor reduces coupling and eases future data-layer additions.

---

## Recommended next implementation

**Start with QW-1: Division Bridge mode (remainders + sharing stories).**

Why now:
- It is the most natural pedagogical step after division.
- Has clear acceptance criteria and testability.
- Creates the conceptual bridge needed for fractions and decimals.
