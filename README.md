# Mathimagic

Mathimagic is a lightweight, mobile-first math practice app designed to help
kids (and anyone) build confidence through short, joyful practice sessions.

## Live Site

GitHub Pages deployment: https://ntodorov.github.io/mathimagic

## Features

- Phone/tablet-first layout with large tap targets
- Fast loading and simple UI
- Friendly feedback after each answer
- Addition and subtraction practice sessions
- Session progress, streaks, and daily goal

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

This project uses `gh-pages` for deployment. The `npm run deploy` script
builds and publishes the `build/` directory to GitHub Pages.
