# Mathimagic Feature Backlog (Prioritized)

Scoring legend:
- **Effort:** S (1-2 days), M (3-7 days), L (1-3 weeks), XL (multi-sprint)
- **Risk:** Low / Medium / High

## Quick Wins (small effort, high impact)

| Priority | Feature | Rationale | Effort | Risk | Suggested Order |
|---|---|---|---|---|---|
| QW-1 | Difficulty + grade selectors (v1 ranges) | Delivers immediately visible personalization; aligns with UX plan; improves replay value. | M | Low | 1 |
| QW-2 | Extract equation generation to pure modules + unit tests | Reduces regression risk and unlocks faster iteration for all upcoming math features. | M | Low | 2 |
| QW-3 | Session metadata badges in history (operation + difficulty + grade + completion) | Makes history meaningful; improves review clarity with minimal UI changes. | S | Low | 3 |
| QW-4 | Local storage schema version + migration helper | Future-proofs data shape changes; prevents breaking old users when session model expands. | S | Medium | 4 |
| QW-5 | Accessibility pass: reduced motion, focus visibility, input labels audit | Low effort, broad quality gain for target audience and mobile accessibility compliance. | S | Low | 5 |

## Medium Projects

| Priority | Feature | Rationale | Effort | Risk | Suggested Order |
|---|---|---|---|---|---|
| MP-1 | Mistake review with explanation cards | Converts practice app into learning app; helps users understand why answers are wrong. | L | Medium | 6 |
| MP-2 | Adaptive practice (weak-fact weighting) | Increases effectiveness by focusing on errors and low-confidence facts. | L | Medium | 7 |
| MP-3 | Component refactor (`App.js` + `EquationList.js` split into domain/ui hooks) | Current large files are maintainability bottlenecks; lowers merge conflicts and bug surface. | L | Medium | 8 |
| MP-4 | Daily goal + streak engine (real logic, not display-only) | Supports retention and habit-building; complements progress section. | M | Medium | 9 |
| MP-5 | Expanded operation set (division with configurable remainder policy) | Broadens curriculum usefulness and progression path. | M | Medium | 10 |

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

1. **Do first:** QW-2 (generation extraction) before deep feature work touching equation logic.
2. **Before adding many new fields:** QW-4 (schema versioning) to avoid migration debt.
3. **Before adaptive engine:** QW-1 and MP-1 should land first to establish metadata and review pipeline.
4. **Before dashboard/sync:** MP-3 refactor reduces coupling and eases future data-layer additions.

---

## Recommended next implementation

**Start with QW-1: Difficulty + grade selectors (v1 ranges).**

Why now:
- Highest immediate user impact relative to effort.
- Has clear acceptance criteria and testability.
- Naturally opens path to adaptive practice and curriculum-level features.
