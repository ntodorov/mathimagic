## UI Experience Plan (Math Learning App)

### Goals
- Phone/tablet first with large tap targets.
- Blazing fast initial load and quick interaction response.
- Modern, friendly, and kid-appropriate visuals.
- Clear progress and encouragement after each answer.

### Information Architecture
- Home / Start Practice
  - Primary CTA: "Start Practice"
  - Quick picks: Operation (addition/subtraction/multiplication/division), Difficulty
  - Persist quick-pick selections across refresh/new tab
  - Default operation is Addition for first-time visitors with no saved preferences
  - Continue last session if available
- Practice
  - Single equation focus with swipeable carousel navigation
  - Operation selector for addition, subtraction, multiplication, and division
  - Immediate feedback
  - Streak + progress indicator
- Review
  - Mistakes list
  - Step-by-step explanation
  - Past session review (read-only)
  - Show each equation, kid answer, and correct answer
  - Show total session time (and per-question time when available)
  - Delete past sessions from history
- Profile
  - Simple progress summary and badges

### Visual System
- Typography: rounded, high legibility (large sizes)
- Color: bright, calm primary with 2 accents
- Shapes: soft corners, friendly cards
- Icons: bold, simple, consistent stroke

### Interaction Guidelines
- One primary action per screen.
- Auto-advance on correct answers.
- Friendly hints after mistakes.
- Optional reduced motion.
- Review mode is clearly labeled and read-only.
- Keep the numeric keypad open by preserving input focus on advance.
- Support swipe left/right plus previous/next buttons for navigation.
- Do not save sessions until at least one answer is provided.

### Delivery Requirements
- A task is only complete when tests are green.

### Performance Targets
- App shell under 100KB JS (gzipped).
- Defer non-critical assets.
- Cache first lesson and icons.

### Accessibility
- Contrast AA or better.
- Numeric keypad on mobile for input.
- Clear focus states and labels.
- Selected options should be visually obvious (strong outline + explicit selected label).
- Enter key hints reflect next/done when moving through questions.

### Curriculum Expansion Plan (Post-Division)

#### Phase 1: Division Bridge (remainders + sharing)
- Reinforce division as fair sharing and grouping.
- Add remainder-first practice mode (e.g., `13 ÷ 4 = 3 R1`).
- Include story prompts: leftovers after equal sharing.

#### Phase 2: Fractions as Division
- Introduce fraction notation directly from division (`a ÷ b = a/b`).
- Start with unit-friendly sets (halves, thirds, fourths).
- Pair symbolic and visual representations (bars, pizza slices).

#### Phase 3: Fraction Sense
- Equivalent fractions, comparing, and ordering.
- Number-line placement to build magnitude intuition.
- Keep explanation-first feedback for incorrect answers.

#### Phase 4: Fractions to Decimals
- Convert common fractions to decimals (tenths/hundredths first).
- Use money-style contexts to ground understanding.

#### Phase 5: Mixed Mastery
- Blend all operations with fraction/decimal questions.
- Focus on transfer via short word-problem challenges.

### Onboarding and Unlock UX Copy
- Keep four core operations always available.
- Show advanced mode cards with lock state until mastery unlock.
- Surface curriculum hint copy in selector:
  - Explain thresholds (accuracy + minimum answered + mastery streak count).
  - Show "Next unlock" mode and progress toward the prerequisite mastery hits.
  - Show unlocked advanced count (for motivation and orientation).
- In review mode, include explanation cards for incorrect fraction/decimal answers:
  - Fraction: format, numerator/denominator swap, simplification guidance.
  - Decimal: place-value and conversion guidance.

### Success Metrics
- Time to first answer under 10 seconds.
- 90 percent complete first session.
- Return rate day 2 improvement.
- 70 percent of learners complete Fractions Phase 1 after Division Bridge.
- Improvement in fraction comparison accuracy over 2 weeks.
