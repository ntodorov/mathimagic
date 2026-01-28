import * as React from 'react';

export default function ButtonAppBar({ playerName }) {
  const trimmedName = playerName ? playerName.trim() : '';

  return (
    <header className="bg-gradient-to-r from-[#ff7ab6] via-[#ffb347] to-[#52d6ff] text-white shadow-sm">
      <div className="mx-auto flex w-full max-w-md items-center gap-3 px-4 py-3 sm:px-6">
        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white transition hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white/60"
          aria-label="menu"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
            aria-hidden="true"
          >
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <div className="flex flex-col leading-tight">
          <span className="text-lg font-extrabold tracking-wide">Mathimagic</span>
          <span className="text-xs font-semibold text-white/80">
            {trimmedName ? `Hi, ${trimmedName}` : 'Playful math adventures'}
          </span>
        </div>
        <div className="flex-1" />
        <button
          type="button"
          className="rounded-full bg-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white/60"
        >
          Grown-ups
        </button>
      </div>
    </header>
  );
}
