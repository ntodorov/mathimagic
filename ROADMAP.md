# Mathimagic Roadmap (Post-Division Curriculum Expansion)

Last updated: 2026-02-19

## Goal
Turn Mathimagic from core operations practice into a guided learning path that naturally continues after division.

## Pedagogical Sequence
1. **Division Bridge** (remainders + sharing stories)
2. **Fractions as Division** (a ÷ b = a/b)
3. **Fraction Sense** (equivalent fractions, compare/order, number lines)
4. **Fractions → Decimals** (tenths/hundredths, money context)
5. **Mixed Mastery** (operations + fractions + decimals + word problems)

---

## Implementation Plan

### Phase 1 — Division Bridge (Sprint 1)
- Add remainder-aware question generator.
- Add answer format support for quotient + remainder.
- Add story-style prompts around equal sharing and leftovers.
- Update session summary to include remainder correctness.

**Acceptance criteria**
- Kids can complete a full session with remainder questions.
- Review mode clearly shows expected quotient/remainder.
- Tests cover generation, answer validation, and review rendering.

### Phase 2 — Fractions as Division (Sprint 2)
- Add fraction question type from division prompts.
- Add visual prompt scaffolding (bars/pizza slices; static v1 assets acceptable).
- Introduce numerator/denominator vocabulary in UI copy.

**Acceptance criteria**
- Questions map division statements to fraction form correctly.
- Visual + symbolic prompts are available in practice and review.
- Tests cover parser/validator behavior for fraction answers.

### Phase 3 — Fraction Sense (Sprint 3)
- Add equivalent fraction drills.
- Add comparison/order exercises.
- Add simple number-line placement interactions (tap/select v1).

**Acceptance criteria**
- Correctness engine supports equivalent representations.
- Session history records sub-mode metadata.
- Tests verify equivalence and comparison logic.

### Phase 4 — Decimals Bridge (Sprint 4)
- Add conversion drills between common fractions and decimals.
- Add money-context word problems.
- Expand review explanations for conversion mistakes.

**Acceptance criteria**
- Decimal conversion accuracy is tracked in session data.
- Common conversions (1/2, 1/4, 3/4, tenths, hundredths) are covered.
- Tests validate conversion generation and grading.

### Phase 5 — Mixed Mastery (Sprint 5+)
- Add blended challenge sessions across all learned concepts.
- Add progression logic to unlock phases based on mastery thresholds.
- Add weak-area targeting in mixed sessions.

**Acceptance criteria**
- Mixed sessions include diverse question types with balanced pacing.
- Unlock/progression state persists safely across app restarts.
- Tests verify unlock thresholds and mixed-set distribution.

---

## Cross-Cutting Technical Work
- Add/extend schema versioning for new curriculum state fields.
- Keep generation logic in domain modules with unit tests first.
- Maintain mobile-first UX (large targets, clear labels, reduced-motion support).
- Ensure review mode remains read-only and comprehensible for parents/kids.

## Definition of Done (per phase)
- `npm run test:ci` passes.
- README + docs updates are included.
- No regression in existing operation practice or history/review flows.
- Manual mobile sanity pass completed.
