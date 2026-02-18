import * as React from 'react';

export default function ButtonAppBar({ username, onRegenerateUsername }) {
  return (
    <header className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 text-white shadow-lg">
      <div className="mx-auto flex w-full max-w-md items-center gap-3 px-4 py-3 sm:px-6">
        <div className="flex h-10 w-10 items-center justify-center text-2xl" aria-hidden="true">
          🧮
        </div>
        <span className="text-xl font-bold tracking-tight drop-shadow-sm">
          Mathimagic
        </span>
        <div className="flex-1" />
        <button
          type="button"
          onClick={onRegenerateUsername}
          className="flex items-center gap-2 rounded-full bg-white/20 px-3 py-1.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/30 focus-visible:ring-2 focus-visible:ring-white/50"
          title="Click to get a new random name!"
          aria-label={`Change player name. Current name ${username}`}
        >
          <span className="text-lg" aria-hidden="true">🦄</span>
          <span className="max-w-[120px] truncate">{username}</span>
        </button>
      </div>
    </header>
  );
}
