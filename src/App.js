import * as React from 'react';
import EquationList from './EquationList';
import ButtonAppBar from './ButtonAppBar';
import { useUsername, useResults } from './useUsername';
import { DEFAULT_OPERATION, OPERATION_OPTIONS, getOperationOption } from './operations';

const PRACTICE_SECTION_ID = 'practice-section';

function App() {
  const { username, regenerateUsername } = useUsername();
  const { results, sessions, recordSession, deleteSession } = useResults();
  const [selectedOperation, setSelectedOperation] = React.useState(DEFAULT_OPERATION);
  const [activeSession, setActiveSession] = React.useState(null);
  const [sessionKey, setSessionKey] = React.useState(0);
  const [currentSessionStats, setCurrentSessionStats] = React.useState({ answered: 0, total: 10 });
  const [reviewSessionId, setReviewSessionId] = React.useState(null);
  const sessionFinalizedRef = React.useRef(false);
  const scrollTimeoutRef = React.useRef(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(false);
  const sessionActive = Boolean(activeSession);

  React.useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return undefined;
    }

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleMotionPreference = () => {
      setPrefersReducedMotion(mediaQuery.matches);
    };

    handleMotionPreference();
    mediaQuery.addEventListener?.('change', handleMotionPreference);

    return () => {
      mediaQuery.removeEventListener?.('change', handleMotionPreference);
    };
  }, []);

  const handleStartPractice = React.useCallback(() => {
    const sessionId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    sessionFinalizedRef.current = false;
    setReviewSessionId(null);
    setActiveSession({
      id: sessionId,
      operationType: selectedOperation,
      startedAt: new Date().toISOString(),
    });
    setSessionKey((prev) => prev + 1);
    setCurrentSessionStats({ answered: 0, total: 10 });
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    scrollTimeoutRef.current = setTimeout(() => {
      const practiceSection = document.getElementById(PRACTICE_SECTION_ID);
      practiceSection?.scrollIntoView?.({
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
        block: 'start',
      });
    }, 100);
  }, [selectedOperation, prefersReducedMotion]);

  React.useEffect(() => () => {
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
  }, []);

  const handleSessionProgress = React.useCallback((answered, total) => {
    setCurrentSessionStats({ answered, total });
  }, []);

  const handleEndSession = React.useCallback((sessionResults) => {
    if (activeSession && !sessionFinalizedRef.current) {
      const attemptedCount = Number(sessionResults.attempted) || 0;
      if (attemptedCount > 0) {
        recordSession({
          id: activeSession.id,
          operationType: activeSession.operationType,
          startedAt: activeSession.startedAt,
          endedAt: new Date().toISOString(),
          correct: sessionResults.correct,
          attempted: attemptedCount,
          total: sessionResults.total ?? attemptedCount,
          completed: sessionResults.completed,
          questions: sessionResults.questions ?? [],
        });
      }
      sessionFinalizedRef.current = true;
    }
    setActiveSession(null);
    setCurrentSessionStats({ answered: 0, total: 10 });
  }, [activeSession, recordSession]);

  const handleReviewToggle = React.useCallback((sessionId) => {
    setReviewSessionId((prev) => (prev === sessionId ? null : sessionId));
  }, []);

  const handleDeleteSession = React.useCallback((sessionId) => {
    deleteSession(sessionId);
    setReviewSessionId((prev) => (prev === sessionId ? null : prev));
  }, [deleteSession]);

  const activeOption = getOperationOption(activeSession?.operationType ?? selectedOperation);
  const sessionProgressPercent = currentSessionStats.total > 0
    ? Math.round((currentSessionStats.answered / currentSessionStats.total) * 100)
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

  const reviewSession = sessions.find((session) => session.id === reviewSessionId) ?? null;
  const reviewOption = reviewSession ? getOperationOption(reviewSession.operationType) : null;
  const reviewQuestions = Array.isArray(reviewSession?.questions) ? reviewSession.questions : [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-100 via-pink-50 to-purple-100 text-slate-900">
      <ButtonAppBar username={username} onRegenerateUsername={regenerateUsername} />
      <main className="mx-auto w-full max-w-md px-4 pb-12 pt-6 sm:px-6">
        <div className="space-y-6">
          {/* Welcome Section */}
          <section
            aria-labelledby="welcome-heading"
            className="rounded-3xl border-2 border-purple-200 bg-gradient-to-br from-purple-100 via-pink-100 to-yellow-100 p-6 shadow-lg"
          >
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="text-4xl">✨🌟✨</div>
                <h1 id="welcome-heading" className="text-3xl font-bold tracking-tight text-purple-700">
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
                          aria-label={`Practice ${option.label}`}
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
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 px-5 py-4 text-lg font-bold text-white shadow-lg transition transform hover:scale-105 hover:shadow-xl focus-visible:ring-4 focus-visible:ring-purple-300"
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
          <section
            aria-labelledby="progress-heading"
            className="rounded-3xl border-2 border-orange-200 bg-gradient-to-br from-orange-100 to-yellow-100 p-4 shadow-md"
          >
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🏅</span>
                <p id="progress-heading" className="text-sm font-bold uppercase tracking-wide text-orange-600">
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
                    Answered {currentSessionStats.answered} / {currentSessionStats.total}
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
              onNewSession={handleStartPractice}
              onEndSession={handleEndSession}
            />
          )}

          <section
            aria-labelledby="history-heading"
            className="rounded-3xl border-2 border-slate-200 bg-white/80 p-4 shadow-md"
          >
            <div className="flex items-center gap-2">
              <span className="text-2xl">📚</span>
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Session History
                </p>
                <h2 id="history-heading" className="text-lg font-bold text-slate-700">
                  Past Sessions
                </h2>
              </div>
            </div>
            {sessions.length > 0 && (
              <p className="mt-2 text-xs text-slate-500">
                Tap Review Answers to see a read-only snapshot.
              </p>
            )}
            {reviewSession && (
              <div className="mt-4 rounded-3xl border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-sky-50 p-4 shadow-inner">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-indigo-500">
                      Review Mode
                    </p>
                    <h3 className="text-lg font-bold text-indigo-700">
                      {reviewOption?.label ?? 'Session'} Review
                    </h3>
                    <p className="text-sm text-indigo-600">
                      Read-only snapshot of a past session.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center rounded-full border border-indigo-200 bg-white px-2 py-1 text-xs font-semibold text-indigo-600">
                      Read-only
                    </span>
                    <button
                      type="button"
                      className="rounded-full border border-indigo-200 bg-white px-3 py-1 text-xs font-semibold text-indigo-600 shadow-sm transition hover:border-indigo-300 hover:text-indigo-700"
                      onClick={() => setReviewSessionId(null)}
                    >
                      Exit Review
                    </button>
                  </div>
                </div>
                <div className="mt-3 rounded-2xl border border-indigo-100 bg-white/80 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs text-slate-500">
                        {formatSessionTimestamp(reviewSession.endedAt ?? reviewSession.startedAt)}
                      </p>
                      <p className="text-sm font-bold text-slate-700">
                        {reviewOption?.label ?? 'Session'} Summary
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-indigo-600">
                        {Number(reviewSession.correct) || 0}/{Number(reviewSession.attempted) || 0}
                      </p>
                      <p className="text-xs text-slate-500">
                        {reviewSession.completed ? 'Completed' : 'Ended early'}
                      </p>
                    </div>
                  </div>
                </div>
                {reviewQuestions.length === 0 ? (
                  <p className="mt-3 text-sm text-slate-500">
                    This session was saved before answer details were available.
                  </p>
                ) : (
                  <ul className="mt-3 space-y-2">
                    {reviewQuestions.map((question) => {
                      const rawAnswer = question.answer ?? '';
                      const answerText = String(rawAnswer).trim();
                      const hasAnswer = typeof question.hasAnswer === 'boolean'
                        ? question.hasAnswer
                        : answerText !== '';
                      const isCorrect = typeof question.isCorrect === 'boolean'
                        ? question.isCorrect
                        : hasAnswer && Number(answerText) === Number(question.solution);
                      const statusLabel = isCorrect ? 'Correct' : hasAnswer ? 'Incorrect' : 'Skipped';
                      const statusClass = isCorrect
                        ? 'text-green-600'
                        : hasAnswer
                          ? 'text-rose-500'
                          : 'text-slate-400';
                      const cardClass = isCorrect
                        ? 'border-green-200 bg-green-50'
                        : hasAnswer
                          ? 'border-rose-200 bg-rose-50'
                          : 'border-slate-200 bg-white';
                      const operationSymbol = question.operation ?? reviewOption?.symbol ?? '';

                      return (
                        <li
                          key={`${reviewSession.id}-${question.id}`}
                          className={`rounded-2xl border-2 p-3 ${cardClass}`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-sm font-bold text-slate-700">
                              {question.x} {operationSymbol} {question.y} =
                            </p>
                            <span className={`text-xs font-bold uppercase ${statusClass}`}>
                              {statusLabel}
                            </span>
                          </div>
                          <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
                            <p>
                              Kid's Answer:{' '}
                              <span className="font-semibold text-slate-700">
                                {hasAnswer ? answerText : 'Not answered'}
                              </span>
                            </p>
                            <p>
                              Correct Answer:{' '}
                              <span className="font-semibold text-slate-700">
                                {question.solution}
                              </span>
                            </p>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            )}
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
                  const isReviewing = reviewSessionId === session.id;
                  return (
                    <li
                      key={session.id}
                      className={`rounded-2xl border border-slate-200 bg-white/80 p-3 ${
                        isReviewing ? 'ring-2 ring-indigo-200' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-bold text-slate-700">
                            {option.label} Session
                            {isReviewing && (
                              <span className="ml-2 inline-flex items-center rounded-full border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-indigo-600">
                                Reviewing
                              </span>
                            )}
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
                      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                        <p className="text-xs text-slate-500">
                          Answered {attempted} of {total}
                        </p>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleReviewToggle(session.id)}
                            aria-pressed={isReviewing}
                            aria-label={`${isReviewing ? 'Close review for' : 'Review answers for'} ${option.label} session ${timestamp || ''}`.trim()}
                            className="rounded-full border border-indigo-200 bg-white px-3 py-1 text-xs font-semibold text-indigo-600 shadow-sm transition hover:border-indigo-300 hover:text-indigo-700"
                          >
                            {isReviewing ? 'Close Review' : 'Review Answers'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteSession(session.id)}
                            aria-label={`Delete ${option.label} session ${timestamp || ''}`.trim()}
                            className="rounded-full border border-rose-200 bg-white px-3 py-1 text-xs font-semibold text-rose-600 shadow-sm transition hover:border-rose-300 hover:text-rose-700"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
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
