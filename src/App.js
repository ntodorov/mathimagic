import * as React from 'react';
import EquationList from './EquationList';
import ButtonAppBar from './ButtonAppBar';
import { useUsername, useResults } from './useUsername';
import { DEFAULT_OPERATION, OPERATION_OPTIONS, getOperationOption } from './operations';

const PRACTICE_SECTION_ID = 'practice-section';

function App() {
  const { username, regenerateUsername } = useUsername();
  const { results, sessions, recordSession } = useResults();
  const [selectedOperation, setSelectedOperation] = React.useState(DEFAULT_OPERATION);
  const [activeSession, setActiveSession] = React.useState(null);
  const [sessionKey, setSessionKey] = React.useState(0);
  const [currentSessionStats, setCurrentSessionStats] = React.useState({ correct: 0, total: 10 });
  const sessionFinalizedRef = React.useRef(false);
  const scrollTimeoutRef = React.useRef(null);
  const sessionActive = Boolean(activeSession);

  const handleStartPractice = React.useCallback(() => {
    const sessionId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    sessionFinalizedRef.current = false;
    setActiveSession({
      id: sessionId,
      operationType: selectedOperation,
      startedAt: new Date().toISOString(),
    });
    setSessionKey((prev) => prev + 1);
    setCurrentSessionStats({ correct: 0, total: 10 });
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    scrollTimeoutRef.current = setTimeout(() => {
      const practiceSection = document.getElementById(PRACTICE_SECTION_ID);
      practiceSection?.scrollIntoView?.({ behavior: 'smooth', block: 'start' });
    }, 100);
  }, [selectedOperation]);

  React.useEffect(() => () => {
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
  }, []);

  const handleSessionProgress = React.useCallback((correct, total) => {
    setCurrentSessionStats({ correct, total });
  }, []);

  const handleSessionComplete = React.useCallback((sessionResults) => {
    if (!activeSession || sessionFinalizedRef.current) {
      return;
    }
    recordSession({
      id: activeSession.id,
      operationType: activeSession.operationType,
      startedAt: activeSession.startedAt,
      endedAt: new Date().toISOString(),
      correct: sessionResults.correct,
      attempted: sessionResults.attempted,
      total: sessionResults.attempted,
      completed: true,
    });
    sessionFinalizedRef.current = true;
  }, [activeSession, recordSession]);

  const handleEndSession = React.useCallback((sessionResults) => {
    if (activeSession && !sessionFinalizedRef.current) {
      recordSession({
        id: activeSession.id,
        operationType: activeSession.operationType,
        startedAt: activeSession.startedAt,
        endedAt: new Date().toISOString(),
        correct: sessionResults.correct,
        attempted: sessionResults.attempted,
        total: sessionResults.total,
        completed: sessionResults.completed,
      });
      sessionFinalizedRef.current = true;
    }
    setActiveSession(null);
    setCurrentSessionStats({ correct: 0, total: 10 });
  }, [activeSession, recordSession]);

  const activeOption = getOperationOption(activeSession?.operationType ?? selectedOperation);
  const sessionProgressPercent = currentSessionStats.total > 0
    ? Math.round((currentSessionStats.correct / currentSessionStats.total) * 100)
    : 0;

  const formatSessionTimestamp = (timestamp) => {
    if (!timestamp) {
      return '';
    }
    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) {
      return '';
    }
    return date.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

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
              {!sessionActive ? (
                <div className="rounded-2xl bg-white/70 p-3">
                  <p className="text-xs font-bold uppercase tracking-wide text-indigo-500">
                    Choose a Challenge
                  </p>
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    {OPERATION_OPTIONS.map((option) => {
                      const isActive = option.id === selectedOperation;
                      return (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => setSelectedOperation(option.id)}
                          aria-pressed={isActive}
                          className={`flex items-center justify-center gap-2 rounded-xl border-2 px-3 py-2 text-sm font-bold transition ${
                            isActive
                              ? 'border-indigo-400 bg-white text-indigo-700 shadow-sm'
                              : 'border-indigo-200 bg-white/60 text-indigo-500 hover:border-indigo-300'
                          }`}
                        >
                          <span className="text-base">{option.symbol}</span>
                          <span>{option.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl bg-white/70 p-3">
                  <p className="text-xs font-bold uppercase tracking-wide text-indigo-500">
                    Challenge Locked
                  </p>
                  <div className="mt-2 flex items-center justify-between rounded-xl border border-indigo-200 bg-white/80 px-3 py-2">
                    <div className="flex items-center gap-2 text-indigo-700">
                      <span className="text-base">{activeOption.symbol}</span>
                      <span className="text-sm font-bold">{activeOption.label}</span>
                    </div>
                    <span className="text-xs font-semibold text-indigo-500">
                      End session to change
                    </span>
                  </div>
                </div>
              )}
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
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-xs font-bold uppercase tracking-wide text-green-600">
                      Current Session
                    </p>
                    <span className="text-xs font-bold uppercase tracking-wide text-indigo-500">
                      {activeOption.label}
                    </span>
                  </div>
                  <div
                    className="h-3 w-full overflow-hidden rounded-full bg-green-100"
                    role="progressbar"
                    aria-label="Session progress"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={sessionProgressPercent}
                  >
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-300"
                      style={{ width: `${sessionProgressPercent}%` }}
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
              operationType={activeSession?.operationType ?? selectedOperation}
              onProgress={handleSessionProgress}
              onSessionComplete={handleSessionComplete}
              onNewSession={handleStartPractice}
              onEndSession={handleEndSession}
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
                  Solve fun addition, subtraction, and multiplication problems and collect stars!
                </p>
              </div>
            </section>
          )}

          <section className="rounded-3xl border-2 border-slate-200 bg-white/80 p-4 shadow-md">
            <div className="flex items-center gap-2">
              <span className="text-2xl">📚</span>
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Session History
                </p>
                <h2 className="text-lg font-bold text-slate-700">
                  Past Sessions
                </h2>
              </div>
            </div>
            {sessions.length === 0 ? (
              <p className="mt-3 text-sm text-slate-500">
                No sessions yet. Finish a session to see it here!
              </p>
            ) : (
              <ul className="mt-4 space-y-3">
                {sessions.map((session) => {
                  const option = getOperationOption(session.operationType);
                  const correct = Number(session.correct) || 0;
                  const attempted = Number(session.attempted) || 0;
                  const total = Number(session.total) || attempted;
                  const timestamp = formatSessionTimestamp(session.endedAt ?? session.startedAt);
                  return (
                    <li
                      key={session.id}
                      className="rounded-2xl border border-slate-200 bg-white/80 p-3"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-bold text-slate-700">
                            {option.label} Session
                          </p>
                          {timestamp && (
                            <p className="text-xs text-slate-500">{timestamp}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-indigo-600">
                            {correct}/{attempted}
                          </p>
                          <p className="text-xs text-slate-500">
                            {session.completed ? 'Completed' : 'Ended early'}
                          </p>
                        </div>
                      </div>
                      <p className="mt-2 text-xs text-slate-500">
                        Answered {attempted} of {total}
                      </p>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

export default App;
