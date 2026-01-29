import * as React from 'react';
import EquationList from './EquationList';
import ButtonAppBar from './ButtonAppBar';
import { useUsername, useResults } from './useUsername';

const PRACTICE_SECTION_ID = 'practice-section';

function App() {
  const { username, regenerateUsername } = useUsername();
  const { results, updateResults } = useResults();
  const [sessionActive, setSessionActive] = React.useState(false);
  const [sessionKey, setSessionKey] = React.useState(0);
  const [currentSessionStats, setCurrentSessionStats] = React.useState({ correct: 0, total: 10 });

  const handleStartPractice = React.useCallback(() => {
    setSessionActive(true);
    setSessionKey((prev) => prev + 1);
    setCurrentSessionStats({ correct: 0, total: 10 });
    setTimeout(() => {
      const practiceSection = document.getElementById(PRACTICE_SECTION_ID);
      practiceSection?.scrollIntoView?.({ behavior: 'smooth', block: 'start' });
    }, 100);
  }, []);

  const handleSessionProgress = React.useCallback((correct, total) => {
    setCurrentSessionStats({ correct, total });
  }, []);

  const handleSessionComplete = React.useCallback((sessionResults) => {
    updateResults(sessionResults);
  }, [updateResults]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-100 via-pink-50 to-purple-100 text-slate-900">
      <ButtonAppBar username={username} onRegenerateUsername={regenerateUsername} />
      <main className="mx-auto w-full max-w-md px-4 pb-12 pt-6 sm:px-6">
        <div className="space-y-6">
          {/* Welcome Section */}
          <section className="rounded-3xl border-2 border-purple-200 bg-gradient-to-br from-purple-100 via-pink-100 to-yellow-100 p-6 shadow-lg">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="text-4xl">✨🌟✨</div>
                <h1 className="text-3xl font-bold tracking-tight text-purple-700">
                  Hey, {username.replace(/[0-9]/g, '')}!
                </h1>
                <p className="text-lg text-purple-600">
                  Ready to become a math superstar today?
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {['🎯 Fun Problems', '⚡ Quick Sessions', '🏆 Earn Stars'].map(
                  (label) => (
                    <span
                      key={label}
                      className="inline-flex items-center rounded-full border-2 border-purple-200 bg-white/70 px-3 py-1 text-sm font-medium text-purple-700"
                    >
                      {label}
                    </span>
                  )
                )}
              </div>
              {!sessionActive && (
                <button
                  type="button"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 px-5 py-4 text-lg font-bold text-white shadow-lg transition transform hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-purple-300"
                  onClick={handleStartPractice}
                  aria-controls={PRACTICE_SECTION_ID}
                >
                  <span className="text-2xl">🚀</span>
                  Start Practice!
                </button>
              )}
            </div>
          </section>

          {/* Stats Section */}
          <section className="rounded-3xl border-2 border-orange-200 bg-gradient-to-br from-orange-100 to-yellow-100 p-4 shadow-md">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🏅</span>
                <p className="text-sm font-bold uppercase tracking-wide text-orange-600">
                  Your Progress
                </p>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="rounded-2xl bg-white/60 p-3">
                  <p className="text-2xl font-bold text-purple-600">{results.totalCorrect}</p>
                  <p className="text-xs font-medium text-purple-500">Stars ⭐</p>
                </div>
                <div className="rounded-2xl bg-white/60 p-3">
                  <p className="text-2xl font-bold text-pink-600">{results.sessionsCompleted}</p>
                  <p className="text-xs font-medium text-pink-500">Sessions 🎮</p>
                </div>
                <div className="rounded-2xl bg-white/60 p-3">
                  <p className="text-2xl font-bold text-orange-600">
                    {results.totalAttempted > 0 
                      ? Math.round((results.totalCorrect / results.totalAttempted) * 100) 
                      : 0}%
                  </p>
                  <p className="text-xs font-medium text-orange-500">Score 🎯</p>
                </div>
              </div>
              {sessionActive && (
                <div className="mt-2 rounded-2xl bg-white/60 p-3">
                  <p className="text-xs font-bold uppercase tracking-wide text-green-600 mb-2">
                    Current Session
                  </p>
                  <div
                    className="h-3 w-full overflow-hidden rounded-full bg-green-100"
                    role="progressbar"
                    aria-label="Session progress"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={Math.round((currentSessionStats.correct / currentSessionStats.total) * 100)}
                  >
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-300"
                      style={{ width: `${(currentSessionStats.correct / currentSessionStats.total) * 100}%` }}
                    />
                  </div>
                  <p className="mt-1 text-sm font-bold text-green-600">
                    {currentSessionStats.correct} / {currentSessionStats.total} ⭐
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Equations Section - Only show when session is active */}
          {sessionActive && (
            <EquationList
              sectionId={PRACTICE_SECTION_ID}
              focusSignal={sessionKey}
              onProgress={handleSessionProgress}
              onSessionComplete={handleSessionComplete}
              onNewSession={handleStartPractice}
            />
          )}

          {/* Encouragement when no session */}
          {!sessionActive && (
            <section className="rounded-3xl border-2 border-green-200 bg-gradient-to-br from-green-100 to-teal-100 p-6 shadow-md text-center">
              <div className="space-y-3">
                <div className="text-5xl">🌈</div>
                <p className="text-lg font-bold text-green-700">
                  Click Start Practice to begin your math adventure!
                </p>
                <p className="text-sm text-green-600">
                  Solve fun addition and subtraction problems and collect stars!
                </p>
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
