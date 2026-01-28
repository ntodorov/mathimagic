import * as React from 'react';
import EquationList from './EquationList';
import ButtonAppBar from './ButtonAppBar';

const PRACTICE_SECTION_ID = 'practice-section';
const USERNAME_STORAGE_KEY = 'mathimagic-player-name';

const FUN_ADJECTIVES = [
  'Sunny',
  'Bouncy',
  'Wiggly',
  'Happy',
  'Silly',
  'Zippy',
  'Brave',
  'Curious',
  'Glittery',
  'Jolly',
  'Nimble',
  'Cheery',
  'Goofy',
  'Lively',
  'Mighty',
  'Sparkly',
];

const FUN_NOUNS = [
  'Panda',
  'Otter',
  'Unicorn',
  'Dragon',
  'Dolphin',
  'Koala',
  'Tiger',
  'Sloth',
  'Robot',
  'Pirate',
  'Ninja',
  'Giraffe',
  'Rocket',
  'Kitten',
  'Puppy',
  'Wizard',
  'Astronaut',
];

const getRandomName = () => {
  const adjective =
    FUN_ADJECTIVES[Math.floor(Math.random() * FUN_ADJECTIVES.length)];
  const noun = FUN_NOUNS[Math.floor(Math.random() * FUN_NOUNS.length)];
  return `${adjective} ${noun}`;
};

const readStoredName = () => {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    return window.localStorage.getItem(USERNAME_STORAGE_KEY);
  } catch (error) {
    return null;
  }
};

const storeName = (name) => {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    window.localStorage.setItem(USERNAME_STORAGE_KEY, name);
  } catch (error) {
    // Ignore storage failures.
  }
};

function App() {
  const [practiceFocusKey, setPracticeFocusKey] = React.useState(0);
  const [sessionStarted, setSessionStarted] = React.useState(false);
  const [playerName, setPlayerName] = React.useState(() => {
    const storedName = readStoredName();
    if (storedName) {
      return storedName;
    }
    const randomName = getRandomName();
    storeName(randomName);
    return randomName;
  });

  const handleStartPractice = React.useCallback(() => {
    setSessionStarted(true);
    setPracticeFocusKey((prev) => prev + 1);
    const practiceSection = document.getElementById(PRACTICE_SECTION_ID);
    practiceSection?.scrollIntoView?.({ behavior: 'smooth', block: 'start' });
  }, []);

  const handleNameChange = React.useCallback((event) => {
    const nextValue = event.target.value;
    setPlayerName(nextValue);
    const trimmedValue = nextValue.trim();
    if (trimmedValue) {
      storeName(trimmedValue);
    }
  }, []);

  const commitName = React.useCallback((rawName) => {
    const trimmedName = rawName.trim();
    if (!trimmedName) {
      const randomName = getRandomName();
      setPlayerName(randomName);
      storeName(randomName);
      return;
    }
    setPlayerName(trimmedName);
    storeName(trimmedName);
  }, []);

  const handleNameBlur = React.useCallback(() => {
    commitName(playerName);
  }, [commitName, playerName]);

  const handleNameKeyDown = React.useCallback(
    (event) => {
      if (event.key !== 'Enter') {
        return;
      }
      event.preventDefault();
      commitName(playerName);
    },
    [commitName, playerName]
  );

  const handleSurpriseName = React.useCallback(() => {
    const randomName = getRandomName();
    setPlayerName(randomName);
    storeName(randomName);
  }, []);

  const sessionButtonLabel = sessionStarted
    ? 'Start another session'
    : 'Start session';
  const displayName = playerName.trim() || 'friend';

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fff4cf] via-[#ffe4f2] to-[#d9f6ff] text-slate-900">
      <ButtonAppBar playerName={playerName} />
      <main className="mx-auto w-full max-w-md px-4 pb-12 pt-6 sm:px-6">
        <div className="space-y-6">
          <section className="rounded-3xl border border-[#ffd9a6] bg-gradient-to-br from-[#fff6c7] via-[#ffe1f0] to-[#d7f7ff] p-6 shadow-[0_20px_60px_-35px_rgba(255,140,187,0.7)]">
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#f97316]">
                  Welcome back
                </p>
                <h1 className="text-3xl font-bold text-slate-900">
                  Hi, {displayName}!
                </h1>
                <p className="text-base text-slate-700">
                  Quick, playful math missions made just for you.
                </p>
              </div>
              <div className="space-y-2">
                <label
                  className="text-xs font-semibold uppercase tracking-wide text-slate-600"
                  htmlFor="player-name"
                >
                  Your fun name
                </label>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <input
                    id="player-name"
                    value={playerName}
                    onChange={handleNameChange}
                    onBlur={handleNameBlur}
                    onKeyDown={handleNameKeyDown}
                    placeholder="Pick a fun name"
                    className="flex-1 rounded-2xl border border-white/70 bg-white/80 px-4 py-2 text-base font-semibold text-slate-800 shadow-sm focus:border-[#ff9ecd] focus:outline-none focus:ring-2 focus:ring-[#ffd6eb]"
                    type="text"
                    autoComplete="nickname"
                  />
                  <button
                    type="button"
                    className="rounded-full border border-white/70 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-[#ffd6eb]"
                    onClick={handleSurpriseName}
                  >
                    Surprise me
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {['Ages 6-10', 'Tiny sessions', 'All smiles'].map((label) => (
                  <span
                    key={label}
                    className="inline-flex items-center rounded-full border border-white/70 bg-white/70 px-3 py-1 text-xs font-semibold text-slate-700"
                  >
                    {label}
                  </span>
                ))}
              </div>
              <button
                type="button"
                className="inline-flex w-full items-center justify-center rounded-full bg-[#ff7ab6] px-5 py-3 text-base font-semibold text-white shadow-md transition hover:bg-[#ff5da6] focus:outline-none focus:ring-2 focus:ring-[#ffd1e8]"
                onClick={handleStartPractice}
                aria-controls={PRACTICE_SECTION_ID}
              >
                {sessionButtonLabel}
              </button>
            </div>
          </section>
          <EquationList
            sectionId={PRACTICE_SECTION_ID}
            focusSignal={practiceFocusKey}
            startSignal={practiceFocusKey}
            isActive={sessionStarted}
            playerName={playerName}
          />
        </div>
      </main>
    </div>
  );
}

export default App;
