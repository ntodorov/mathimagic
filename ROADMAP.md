# Mathimagic Roadmap (Phase 1 Planning)

Last updated: 2026-02-17

## 1) Audit Summary

### Repository/access status
- ✅ Repository cloned successfully from `https://github.com/ntodorov/mathimagic` into:
  - `/home/jarviz/.openclaw/workspace/projects/mathimagic`
- ✅ Test baseline is healthy:
  - `npm run test:ci` → **4 suites, 18 tests, all passing**
- ✅ CI/CD exists via GitHub Actions (`.github/workflows/deploy.yml`) and deploys to GitHub Pages on `master`.
- ✅ Open GitHub issues check returned none (`/repos/ntodorov/mathimagic/issues?state=open` returned `[]`).

### Current architecture (practical view)
- **Frontend:** Create React App + React 19 + Tailwind CSS.
- **State/persistence:** Local state and `localStorage` via `useUsername` + `useResults` hooks.
- **Core flow:**
  - Landing page + operation selection (add/subtract/multiply)
  - Single-question practice card with next/back/swipe
  - Session end + summary persistence
  - Session history + read-only review + delete
- **Code shape:**
  - `App.js` (~467 LOC) and `EquationList.js` (~432 LOC) are currently monolithic.
  - Math generation logic is embedded in UI file (`EquationList.js`) rather than isolated domain modules.

### Key opportunities
1. **Difficulty/grade system is planned in docs but not implemented yet** (high user-visible value).
2. **No guided mistakes review/hints/explanations yet** (high learning impact).
3. **Large components increase future change risk** (maintainability bottleneck).
4. **No adaptive content strategy** (all users get same random distribution).
5. **No achievements/profile progression model despite UX vision**.

---

## 2) Prioritized implementation order

### Phase A (Immediate: 1-2 sprints)
1. Add difficulty + grade controls and wire generation ranges by operation.
2. Refactor equation generation into tested domain modules (`src/domain/` or `src/lib/`).
3. Add “mistakes review” panel with per-question explanation skeleton.
4. Introduce schema versioning/migration for `localStorage` session data.

### Phase B (Near-term: 2-4 sprints)
5. Adaptive practice mode (bias toward weak facts).
6. Student profile primitives (daily goal, streak logic, badges v1).
7. Accessibility hardening (reduced motion support, keyboard and SR labels polish).

### Phase C (Long-term/high impact)
8. Parent/teacher insights dashboard (aggregated weak areas + trends).
9. Offline-first reliability (service worker strategy and cache management).
10. Optional cloud sync/export/import for device portability.

---

## 3) First recommended feature to implement next

## **Feature: Difficulty + Grade-Aware Problem Generation (v1)**

Why this should be first:
- Already implied in `docs/UX_PLAN.md` (grade + difficulty quick picks).
- High user impact with moderate implementation scope.
- Creates clean foundation for adaptive learning and profile features.
- Minimal product risk because it extends existing equation generation behavior.

### Acceptance criteria
1. **UI controls**
   - Home/start section includes:
     - Difficulty selector: Easy / Medium / Hard
     - Grade selector: K-2 / 3-4 / 5+
   - Controls are disabled/locked while a session is active (same behavior as operation lock).

2. **Generation behavior**
   - Equation ranges vary deterministically by `{operation, grade, difficulty}` profile.
   - Subtraction never produces negative answers in v1 unless explicitly configured.
   - Multiplication ranges scale with difficulty (e.g., 1-5, 1-10, 1-12+).

3. **Persistence/session model**
   - Saved session includes `difficulty` and `gradeBand` fields.
   - Review/history UI shows the selected profile for each session.

4. **Testing**
   - Unit tests for generation profile mapping per operation.
   - Integration tests confirming selected controls affect generated equations.
   - Existing tests remain green.

5. **Docs**
   - Update `README.md` features list and `docs/UX_PLAN.md`.
   - Add/mark relevant items in `docs/TASKS.md`.

Definition of done:
- All CI checks pass.
- No regression in existing session history/review/deletion flow.
- Manual sanity check on mobile viewport confirms usability of new controls.
