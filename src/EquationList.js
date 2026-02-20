import React from 'react';
import Equation from './Equation';
import { DEFAULT_OPERATION, getOperationOption } from './operations';
import {
  DEFAULT_DIFFICULTY,
  DEFAULT_GRADE_BAND,
  generateOperationSet,
  evaluateQuestionAnswer,
  formatCorrectAnswer,
  buildReviewExplanation,
} from './domain/generation';

const EMPTY_ADAPTIVE_FACTS = [];

function buildOperation(type, gradeBand, difficulty, adaptiveFacts) {
  return generateOperationSet({
    operation: type,
    gradeBand,
    difficulty,
    adaptiveFacts,
  });
}

const EquationList = ({
  sectionId,
  focusSignal,
  onProgress,
  onNewSession,
  onEndSession,
  operationType = DEFAULT_OPERATION,
  gradeBand = DEFAULT_GRADE_BAND,
  difficulty = DEFAULT_DIFFICULTY,
  adaptiveFacts = EMPTY_ADAPTIVE_FACTS,
}) => {
  const [operation, setOperation] = React.useState(
    () => buildOperation(operationType, gradeBand, difficulty, adaptiveFacts)
  );
  const [answers, setAnswers] = React.useState({});
  const [sessionCompleted, setSessionCompleted] = React.useState(false);
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const activeInputRef = React.useRef(null);
  const focusTimeoutRef = React.useRef(null);
  const swipeStartRef = React.useRef({ x: 0, y: 0, ignore: false });
  const sessionStartedAtMsRef = React.useRef(Date.now());
  const questionTimingRef = React.useRef({});

  const focusInput = React.useCallback(() => {
    activeInputRef.current?.focus({ preventScroll: true });
  }, []);

  const scheduleFocus = React.useCallback(() => {
    if (focusTimeoutRef.current) {
      clearTimeout(focusTimeoutRef.current);
    }
    focusTimeoutRef.current = setTimeout(() => {
      focusInput();
    }, 100);
  }, [focusInput]);

  const activateQuestionTiming = React.useCallback((questionId) => {
    if (questionId == null) {
      return;
    }

    const now = Date.now();
    const entry = questionTimingRef.current[questionId] ?? { durationMs: 0, firstShownAt: null, lastShownAt: null };

    if (!entry.firstShownAt) {
      entry.firstShownAt = new Date(now).toISOString();
    }

    entry.lastShownAt = now;
    questionTimingRef.current[questionId] = entry;
  }, []);

  const stopQuestionTiming = React.useCallback((questionId) => {
    if (questionId == null) {
      return;
    }

    const now = Date.now();
    const entry = questionTimingRef.current[questionId] ?? { durationMs: 0, firstShownAt: null, lastShownAt: null };

    if (typeof entry.lastShownAt === 'number') {
      entry.durationMs += Math.max(0, now - entry.lastShownAt);
      entry.lastShownAt = null;
    }

    questionTimingRef.current[questionId] = entry;
  }, []);

  const resetSession = React.useCallback((nextOperationType, nextGradeBand, nextDifficulty, nextAdaptiveFacts) => {
    const resolvedType = nextOperationType ?? operationType;
    const resolvedGradeBand = nextGradeBand ?? gradeBand;
    const resolvedDifficulty = nextDifficulty ?? difficulty;
    const resolvedAdaptiveFacts = nextAdaptiveFacts ?? adaptiveFacts;
    const nextOperation = buildOperation(
      resolvedType,
      resolvedGradeBand,
      resolvedDifficulty,
      resolvedAdaptiveFacts
    );

    sessionStartedAtMsRef.current = Date.now();
    questionTimingRef.current = {};

    setOperation(nextOperation);
    setAnswers({});
    setSessionCompleted(false);
    setCurrentIndex(0);

    const firstEquation = nextOperation.equations[0];
    if (firstEquation) {
      activateQuestionTiming(firstEquation.id);
    }

    scheduleFocus();
  }, [operationType, gradeBand, difficulty, adaptiveFacts, scheduleFocus, activateQuestionTiming]);

  React.useEffect(() => () => {
    if (focusTimeoutRef.current) {
      clearTimeout(focusTimeoutRef.current);
    }
  }, []);

  React.useEffect(() => {
    scheduleFocus();
  }, [currentIndex, scheduleFocus]);

  React.useEffect(() => {
    const activeEquation = operation.equations[currentIndex];
    if (activeEquation) {
      activateQuestionTiming(activeEquation.id);
    }
  }, [operation.equations, currentIndex, activateQuestionTiming]);

  const handleAnswerChange = React.useCallback((id, payload) => {
    const question = operation.equations.find((eq) => eq.id === id);
    if (!question) {
      return;
    }
    const evaluated = evaluateQuestionAnswer(question, payload?.value ?? '');
    setAnswers((prev) => ({
      ...prev,
      [id]: evaluated,
    }));
  }, [operation.equations]);

  const buildSessionQuestions = React.useCallback(() => (
    operation.equations.map((eq) => {
      const entry = answers[eq.id] ?? evaluateQuestionAnswer(eq, '');
      const rawValue = entry?.value ?? '';
      const normalizedValue = entry?.normalizedValue ?? String(rawValue).trim();
      const hasAnswer = Boolean(entry?.hasAnswer);
      const isCorrect = Boolean(entry?.isCorrect);

      const timing = questionTimingRef.current[eq.id] ?? {};
      const perQuestionDurationMs = Math.max(0, Math.round(Number(timing.durationMs) || 0));
      const explanation = hasAnswer && !isCorrect
        ? buildReviewExplanation(eq, normalizedValue || rawValue)
        : null;

      return {
        id: eq.id,
        x: eq.x ?? null,
        y: eq.y ?? null,
        operation: eq.operation ?? null,
        sourceMode: eq.sourceMode ?? operation.type,
        prompt: eq.prompt ?? `${eq.x} ${eq.operation} ${eq.y} =`,
        visualPrompt: eq.visualPrompt ?? null,
        contextPrompt: eq.contextPrompt ?? null,
        answerType: eq.answerType ?? 'number',
        solution: eq.solution,
        correctAnswerText: formatCorrectAnswer(eq),
        answer: hasAnswer ? normalizedValue : '',
        hasAnswer,
        isCorrect,
        explanation,
        firstShownAt: timing.firstShownAt ?? null,
        perQuestionDurationMs,
      };
    })
  ), [operation.equations, operation.type, answers]);

  const handleReset = React.useCallback(() => {
    if (onNewSession) {
      onNewSession();
    } else {
      resetSession();
    }
  }, [onNewSession, resetSession]);

  React.useEffect(() => {
    if (!focusSignal) {
      return;
    }
    resetSession();
  }, [focusSignal, resetSession]);

  React.useEffect(() => {
    resetSession(operationType, gradeBand, difficulty, adaptiveFacts);
  }, [operationType, gradeBand, difficulty, adaptiveFacts, resetSession]);

  const totalQuestions = operation.equations.length;
  const answerEntries = Object.values(answers);
  const correctCount = answerEntries.filter((entry) => entry.isCorrect).length;
  const attemptedCount = answerEntries.filter((entry) => entry.hasAnswer).length;
  const progressValue = totalQuestions === 0 ? 0 : (attemptedCount / totalQuestions) * 100;

  const activeOption = getOperationOption(operationType);

  // Call onProgress when progress changes
  React.useEffect(() => {
    if (onProgress) {
      onProgress(attemptedCount, totalQuestions);
    }
  }, [attemptedCount, totalQuestions, onProgress]);

  // Check for session completion
  React.useEffect(() => {
    if (attemptedCount === totalQuestions && attemptedCount > 0 && !sessionCompleted) {
      setSessionCompleted(true);
    }
  }, [attemptedCount, totalQuestions, sessionCompleted]);

  const handleEndSession = React.useCallback(() => {
    if (!onEndSession) {
      return;
    }

    const activeEquation = operation.equations[currentIndex];
    if (activeEquation) {
      stopQuestionTiming(activeEquation.id);
    }

    const endedAtMs = Date.now();
    const sessionQuestions = buildSessionQuestions();
    onEndSession({
      correct: correctCount,
      attempted: attemptedCount,
      total: totalQuestions,
      completed: attemptedCount === totalQuestions && totalQuestions > 0,
      startedAt: new Date(sessionStartedAtMsRef.current).toISOString(),
      endedAt: new Date(endedAtMs).toISOString(),
      durationMs: Math.max(0, endedAtMs - sessionStartedAtMsRef.current),
      questions: sessionQuestions,
    });
  }, [onEndSession, correctCount, attemptedCount, totalQuestions, buildSessionQuestions, stopQuestionTiming, operation.equations, currentIndex]);
  const currentEquation = operation.equations[currentIndex];
  const currentAnswer = currentEquation ? answers[currentEquation.id] : null;
  const currentAnswerValue = currentAnswer?.value ?? '';
  const isLastQuestion = totalQuestions > 0 && currentIndex >= totalQuestions - 1;
  const canAdvance = Boolean(currentAnswer?.hasAnswer);
  const canGoBack = currentIndex > 0;
  const questionNumber = totalQuestions === 0 ? 0 : currentIndex + 1;

  const handleNext = React.useCallback((valueOverride) => {
    if (!currentEquation) {
      return;
    }
    const valueToCheck = valueOverride ?? currentAnswer?.value ?? '';
    if (String(valueToCheck).trim() === '') {
      focusInput();
      return;
    }
    stopQuestionTiming(currentEquation.id);
    if (isLastQuestion) {
      handleEndSession();
      return;
    }
    focusInput();
    setCurrentIndex((prev) => Math.min(prev + 1, totalQuestions - 1));
  }, [currentEquation, currentAnswer, totalQuestions, focusInput, isLastQuestion, handleEndSession, stopQuestionTiming]);

  const handlePrev = React.useCallback(() => {
    if (currentEquation) {
      stopQuestionTiming(currentEquation.id);
    }
    focusInput();
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  }, [focusInput, currentEquation, stopQuestionTiming]);

  const handleSwipeStart = React.useCallback((event) => {
    const touch = event.touches[0];
    if (!touch) {
      return;
    }
    swipeStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      ignore: event.target?.tagName === 'INPUT',
    };
  }, []);

  const handleSwipeEnd = React.useCallback((event) => {
    const touch = event.changedTouches[0];
    if (!touch) {
      return;
    }
    const { x, y, ignore } = swipeStartRef.current;
    if (ignore) {
      return;
    }
    const deltaX = touch.clientX - x;
    const deltaY = touch.clientY - y;
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);
    if (absX < 40 || absX < absY) {
      return;
    }
    if (deltaX < 0) {
      handleNext();
    } else {
      handlePrev();
    }
  }, [handleNext, handlePrev]);

  const handleSectionKeyDown = React.useCallback((event) => {
    if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) {
      return;
    }

    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      handlePrev();
      return;
    }

    if (event.key === 'ArrowRight') {
      event.preventDefault();
      handleNext();
    }
  }, [handleNext, handlePrev]);

  return (
    <section
      id={sectionId}
      aria-labelledby="practice-heading"
      onKeyDown={handleSectionKeyDown}
      className="rounded-3xl border-2 border-blue-200 bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 p-4 shadow-lg"
    >
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🧮</span>
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-indigo-500">
              Practice Time!
            </p>
            <h2 id="practice-heading" className="text-lg font-bold text-indigo-700">
              {activeOption.label} Challenge
            </h2>
            {operation.adaptiveQuestionCount > 0 && (
              <p className="text-xs font-semibold text-indigo-500">
                Adaptive focus: revisiting {operation.adaptiveQuestionCount} tricky fact
                {operation.adaptiveQuestionCount === 1 ? '' : 's'}.
              </p>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <div onTouchStart={handleSwipeStart} onTouchEnd={handleSwipeEnd}>
            {currentEquation ? (
              <Equation
                eq={currentEquation}
                onAnswerChange={handleAnswerChange}
                inputRef={activeInputRef}
                value={currentAnswerValue}
                onNext={handleNext}
                enterKeyHint={isLastQuestion ? 'done' : 'next'}
                nextLabel={isLastQuestion ? 'Done' : 'Next'}
              />
            ) : (
              <p className="text-sm font-semibold text-slate-500">
                No questions available yet.
              </p>
            )}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-indigo-100 bg-white/80 p-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-indigo-500">
                Question
              </p>
              <p className="text-sm font-semibold text-slate-700" aria-live="polite">
                {questionNumber} of {totalQuestions}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="Go to previous question"
                className="inline-flex items-center gap-2 rounded-full border-2 border-indigo-100 bg-white px-3 py-2 text-xs font-bold text-indigo-500 shadow-sm transition hover:border-indigo-200 hover:text-indigo-600 focus-visible:ring-4 focus-visible:ring-indigo-100 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400"
                onClick={handlePrev}
                disabled={!canGoBack}
              >
                <span aria-hidden="true">⬅️</span>
                Previous
              </button>
              <button
                type="button"
                aria-label={isLastQuestion ? 'Finish session' : 'Go to next question'}
                className="inline-flex items-center gap-2 rounded-full border-2 border-indigo-200 bg-white px-4 py-2 text-sm font-bold text-indigo-600 shadow-sm transition hover:border-indigo-300 hover:text-indigo-700 focus-visible:ring-4 focus-visible:ring-indigo-200 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400"
                onClick={() => handleNext()}
                disabled={!canAdvance}
              >
                {isLastQuestion ? 'Done' : 'Next'}
                <span aria-hidden="true">{isLastQuestion ? '🏁' : '➡️'}</span>
              </button>
            </div>
          </div>
        </div>
        
        <hr className="border-indigo-200" />
        
        <div className="space-y-3">
          {/* Session Stats */}
          <div className="flex items-center justify-between rounded-2xl bg-white/60 p-3" aria-live="polite">
            <div className="flex items-center gap-2">
              <span className="text-xl" aria-hidden="true">📝</span>
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-amber-600">
                  Answered
                </p>
                <p className="text-xl font-bold text-amber-600">
                  {attemptedCount}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl" aria-hidden="true">🎯</span>
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-purple-600">
                  Progress
                </p>
                <p className="text-xl font-bold text-purple-600">
                  {attemptedCount}/{totalQuestions}
                </p>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div
            className="h-4 w-full overflow-hidden rounded-full bg-purple-100"
            role="progressbar"
            aria-label="Session progress"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progressValue)}
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 transition-all duration-300"
              style={{ width: `${progressValue}%` }}
            />
          </div>

          {/* Completion Message */}
          {sessionCompleted && (
            <div className="rounded-2xl border-2 border-green-300 bg-gradient-to-r from-green-100 to-teal-100 p-4 text-center" role="status" aria-live="polite">
              <div className="text-4xl mb-2" aria-hidden="true">🎉</div>
              <p className="text-lg font-bold text-green-700">
                All questions answered!
              </p>
              <p className="text-sm text-green-600">
                Press End Session to see your results.
              </p>
            </div>
          )}

          <div className="space-y-2">
            <button
              type="button"
              aria-label="End current session"
              className="w-full flex items-center justify-center gap-2 rounded-full border-2 border-rose-200 bg-white/80 px-4 py-3 text-base font-bold text-rose-600 shadow-sm transition hover:border-rose-300 hover:text-rose-700 focus-visible:ring-4 focus-visible:ring-rose-200"
              onClick={handleEndSession}
            >
              <span className="text-xl" aria-hidden="true">🏁</span>
              End Session
            </button>
            <button
              type="button"
              aria-label="Start a new set of practice problems"
              className="w-full flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-green-400 to-teal-400 px-4 py-3 text-base font-bold text-white shadow-md transition transform hover:scale-105 hover:shadow-lg focus-visible:ring-4 focus-visible:ring-green-200"
              onClick={handleReset}
            >
              <span className="text-xl" aria-hidden="true">🔄</span>
              Try New Problems!
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EquationList;
