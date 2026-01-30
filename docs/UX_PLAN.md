## UI Experience Plan (Math Learning App)

### Goals
- Phone/tablet first with large tap targets.
- Blazing fast initial load and quick interaction response.
- Modern, friendly, and kid-appropriate visuals.
- Clear progress and encouragement after each answer.

### Information Architecture
- Home / Start Practice
  - Primary CTA: "Start Practice"
  - Quick picks: Grade, Operation (addition/subtraction/multiplication), Difficulty
  - Continue last session if available
- Practice
  - Single equation focus with swipeable carousel navigation
  - Operation selector for addition, subtraction, and multiplication
  - Immediate feedback
  - Streak + progress indicator
- Review
  - Mistakes list
  - Step-by-step explanation
  - Past session review (read-only)
  - Show each equation, kid answer, and correct answer
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
- Enter key hints reflect next/done when moving through questions.

### Success Metrics
- Time to first answer under 10 seconds.
- 90 percent complete first session.
- Return rate day 2 improvement.
