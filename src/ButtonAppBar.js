import * as React from 'react';

export default function ButtonAppBar() {
  return (
    <header className="bg-slate-900 text-white">
      <div className="mx-auto flex w-full max-w-md items-center gap-3 px-4 py-3 sm:px-6">
        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/40"
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
        <span className="text-lg font-semibold">Mathimagic</span>
        <div className="flex-1" />
        <button
          type="button"
          className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/40"
        >
          Login
        </button>
      </div>
    </header>
  );
}
