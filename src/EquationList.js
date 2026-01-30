import React from 'react';
import Equation from './Equation';
import { DEFAULT_OPERATION, getOperationOption } from './operations';

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

function createSubtractionOperation() {
  const operation = {
    name: 'Subtraction',
    type: 'subtraction',
    equations: [],
  };

  while (operation.equations.length < 10) {
    const x = getRandomInt(2, 20);
    const y = getRandomInt(1, x);
    operation.equations.push({
      x,
      y,
      operation: '-',
      solution: x - y,
      id: operation.equations.length + 1,
    });
  }
  return operation;
}

function createAdditionOperation() {
  const operation = {
    name: 'Addition',
    type: 'addition',
    equations: [],
  };

  while (operation.equations.length < 10) {
    const x = getRandomInt(1, 11);
    const y = getRandomInt(1, 11);
    operation.equations.push({
      x,
      y,
      operation: '+',
      solution: x + y,
      id: operation.equations.length + 1,
    });
  }
  return operation;
}

function createMultiplicationOperation() {
  const operation = {
    name: 'Multiplication',
    type: 'multiplication',
    equations: [],
  };

  while (operation.equations.length < 10) {
    const x = getRandomInt(1, 11);
    const y = getRandomInt(1, 11);
    operation.equations.push({
      x,
      y,
      operation: '×',
      solution: x * y,
      id: operation.equations.length + 1,
    });
  }
  return operation;
}

function buildOperation(type) {
  switch (type) {
    case 'addition':
      return createAdditionOperation();
    case 'multiplication':
      return createMultiplicationOperation();
    case 'subtraction':
    default:
      return createSubtractionOperation();
  }
}

const EquationList = ({
  sectionId,
  focusSignal,
  onProgress,
  onNewSession,
  onEndSession,
  operationType = DEFAULT_OPERATION,
}) => {
  const [operation, setOperation] = React.useState(() => buildOperation(operationType));
  const [answers, setAnswers] = React.useState({});
  const [sessionCompleted, setSessionCompleted] = React.useState(false);
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const activeInputRef = React.useRef(null);
  const focusTimeoutRef = React.useRef(null);
  const swipeStartRef = React.useRef({ x: 0, y: 0, ignore: false });

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

  const resetSession = React.useCallback((nextOperationType) => {
    const resolvedType = nextOperationType ?? operationType;
    setOperation(buildOperation(resolvedType));
    setAnswers({});
    setSessionCompleted(false);
    setCurrentIndex(0);
    scheduleFocus();
  }, [operationType, scheduleFocus]);

  React.useEffect(() => () => {
    if (focusTimeoutRef.current) {
      clearTimeout(focusTimeoutRef.current);
    }
  }, []);

  React.useEffect(() => {
    scheduleFocus();
  }, [currentIndex, scheduleFocus]);

  const handleAnswerChange = React.useCallback((id, payload) => {
    setAnswers((prev) => ({
      ...prev,
      [id]: payload,
    }));
  }, []);

  const buildSessionQuestions = React.useCallback(() => (
    operation.equations.map((eq) => {
      const entry = answers[eq.id];
      const rawValue = entry?.value ?? '';
      const trimmedValue = String(rawValue).trim();
      const hasAnswer = trimmedValue !== '';
      const isCorrect = hasAnswer && Number(trimmedValue) === eq.solution;

      return {
        id: eq.id,
        x: eq.x,
        y: eq.y,
        operation: eq.operation,
        solution: eq.solution,
        answer: trimmedValue,
        hasAnswer,
        isCorrect,
      };
    })
  ), [operation.equations, answers]);

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
    resetSession(operationType);
  }, [operationType, resetSession]);

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

    const sessionQuestions = buildSessionQuestions();
    onEndSession({
      correct: correctCount,
      attempted: attemptedCount,
      total: totalQuestions,
      completed: attemptedCount === totalQuestions && totalQuestions > 0,
      questions: sessionQuestions,
    });
  }, [onEndSession, correctCount, attemptedCount, totalQuestions, buildSessionQuestions]);
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
    focusInput();
    setCurrentIndex((prev) => Math.min(prev + 1, totalQuestions - 1));
  }, [currentEquation, currentAnswer, totalQuestions, focusInput]);

  const handlePrev = React.useCallback(() => {
    focusInput();
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  }, [focusInput]);

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

  return (
    <section
      id={sectionId}
      className="rounded-3xl border-2 border-blue-200 bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 p-4 shadow-lg"
    >
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🧮</span>
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-indigo-500">
              Practice Time!
            </p>
            <h2 className="text-lg font-bold text-indigo-700">
              {activeOption.label} Challenge
            </h2>
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
                onNext={isLastQuestion ? undefined : handleNext}
                enterKeyHint={isLastQuestion ? 'done' : 'next'}
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
              <p className="text-sm font-semibold text-slate-700">
                {questionNumber} of {totalQuestions}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-full border-2 border-indigo-100 bg-white px-3 py-2 text-xs font-bold text-indigo-500 shadow-sm transition hover:border-indigo-200 hover:text-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400"
                onClick={handlePrev}
                disabled={!canGoBack}
              >
                <span aria-hidden="true">⬅️</span>
                Previous
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-full border-2 border-indigo-200 bg-white px-4 py-2 text-sm font-bold text-indigo-600 shadow-sm transition hover:border-indigo-300 hover:text-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-200 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400"
                onClick={() => handleNext()}
                disabled={!canAdvance || isLastQuestion}
              >
                Next
                <span aria-hidden="true">➡️</span>
              </button>
            </div>
          </div>
        </div>
        
        <hr className="border-indigo-200" />
        
        <div className="space-y-3">
          {/* Session Stats */}
          <div className="flex items-center justify-between rounded-2xl bg-white/60 p-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">📝</span>
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
              <span className="text-xl">🎯</span>
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
            <div className="rounded-2xl bg-gradient-to-r from-green-100 to-teal-100 p-4 text-center border-2 border-green-300">
              <div className="text-4xl mb-2">🎉</div>
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
              className="w-full flex items-center justify-center gap-2 rounded-full border-2 border-rose-200 bg-white/80 px-4 py-3 text-base font-bold text-rose-600 shadow-sm transition hover:border-rose-300 hover:text-rose-700 focus:outline-none focus:ring-4 focus:ring-rose-200"
              onClick={handleEndSession}
            >
              <span className="text-xl">🏁</span>
              End Session
            </button>
            <button
              type="button"
              className="w-full flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-green-400 to-teal-400 px-4 py-3 text-base font-bold text-white shadow-md transition transform hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-green-200"
              onClick={handleReset}
            >
              <span className="text-xl">🔄</span>
              Try New Problems!
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EquationList;
