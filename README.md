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
- Clear selected-state highlight in challenge picker
- Session history with read-only review of past answers
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
- `npm run build` - Production build
- `npm run deploy` - Build and deploy to GitHub Pages

## Testing

```bash
npm run test:ci
```

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
