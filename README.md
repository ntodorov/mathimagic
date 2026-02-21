# Mathimagic

Mathimagic is a lightweight, mobile-first math practice app designed to help
kids (and anyone) build confidence through short, joyful practice sessions.

## Live Site

GitHub Pages deployment: https://ntodorov.github.io/mathimagic

## Features

- Phone/tablet-first layout with large tap targets
- Fast loading and simple UI
- Single-question practice flow with Next/Enter and Done navigation
- Results shown after ending a session or in review mode
- Addition, subtraction, multiplication, and division practice sessions
- Division Bridge mode with quotient/remainder (`q R r`) scoring and sharing-story prompts
- Fractions mode (division-to-fraction) with visual + symbolic prompts
- Fraction Sense mode with equivalent, compare, order, and number-line prompts
- Decimals Bridge mode with fraction/decimal conversion and money context questions
- Mixed Mastery sets blending operations, fractions, and decimals
- Curriculum progression that unlocks post-division modes after mastery thresholds
- Adaptive core-operation sessions that prioritize recently missed facts
- Challenge selections (operation and difficulty) are remembered across refreshes/tabs
- New browsers default to Addition when no saved challenge exists
- Clear selected-state highlight in challenge picker
- Session history with read-only review of past answers
- Review explanations for missed fraction/decimal questions
- Session and per-question timing shown in history/review when available
- Sessions only saved after at least one answer
- Delete past sessions from history
- Session progress indicator

## Tech Stack

- React + Tailwind CSS
- Create React App tooling

## Getting Started

```bash
npm install
npm start
```

Open http://localhost:3000 to view the app in your browser.

## Scripts

- `npm start` - Run the app in development mode
- `npm test` - Interactive test runner
- `npm run test:ci` - Run tests once (CI-friendly)
- `npm run e2e` - Run Playwright smoke tests in headless Chromium
- `npm run e2e:headed` - Run Playwright smoke tests in headed Chromium (local debugging)
- `npm run verify` - Run build + unit + e2e in sequence
- `npm run build` - Production build
- `npm run deploy` - Build and deploy to GitHub Pages

## Testing

```bash
npx --yes playwright install chromium
npm run test:ci
npm run e2e
```

Run the full fast-feedback verification suite with:

```bash
npm run verify
```

`npm run e2e` uses Chromium only.

## CI

`.github/workflows/ci.yml` runs on every `push` and `pull_request` and performs:

1. `npm ci`
2. `npm run build`
3. `npm run test:ci`
4. `npx --yes playwright install --with-deps chromium`
5. `npm run e2e`

If end-to-end tests fail, Playwright artifacts (`playwright-report/` and
`test-results/`) are uploaded automatically.

## Documentation

All project documentation lives in `docs/`:

- `docs/UX_PLAN.md` - UI/UX goals and plan
- `docs/TASKS.md` - Main functionality tasks and status

## Deployment

This project uses GitHub Actions for automatic deployment. When a PR is merged
to the `master` branch, the workflow automatically:

1. Runs tests
2. Builds the production app
3. Deploys to GitHub Pages

You can view the deployment at: https://ntodorov.github.io/mathimagic

### Manual Deployment (Legacy)

The `npm run deploy` script is still available for manual deployments if needed.
It builds and publishes the `build/` directory to GitHub Pages using `gh-pages`.
