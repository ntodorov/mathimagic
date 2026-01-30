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
  onSessionComplete,
  onNewSession,
  onEndSession,
  operationType = DEFAULT_OPERATION,
}) => {
  const [operation, setOperation] = React.useState(() => buildOperation(operationType));
  const [answers, setAnswers] = React.useState({});
  const [sessionCompleted, setSessionCompleted] = React.useState(false);
  const firstInputRef = React.useRef(null);
  const focusTimeoutRef = React.useRef(null);

  const resetSession = React.useCallback((nextOperationType) => {
    const resolvedType = nextOperationType ?? operationType;
    setOperation(buildOperation(resolvedType));
    setAnswers({});
    setSessionCompleted(false);
    if (focusTimeoutRef.current) {
      clearTimeout(focusTimeoutRef.current);
    }
    focusTimeoutRef.current = setTimeout(() => {
      firstInputRef.current?.focus({ preventScroll: true });
    }, 100);
  }, [operationType]);

  React.useEffect(() => () => {
    if (focusTimeoutRef.current) {
      clearTimeout(focusTimeoutRef.current);
    }
  }, []);

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
  const progressValue = totalQuestions === 0 ? 0 : (correctCount / totalQuestions) * 100;

  const activeOption = getOperationOption(operationType);

  // Call onProgress when progress changes
  React.useEffect(() => {
    if (onProgress) {
      onProgress(correctCount, totalQuestions);
    }
  }, [correctCount, totalQuestions, onProgress]);

  // Check for session completion
  React.useEffect(() => {
    if (attemptedCount === totalQuestions && attemptedCount > 0 && !sessionCompleted) {
      setSessionCompleted(true);
      if (onSessionComplete) {
        const sessionQuestions = buildSessionQuestions();
        onSessionComplete({
          correct: correctCount,
          attempted: totalQuestions,
          total: totalQuestions,
          completed: true,
          questions: sessionQuestions,
        });
      }
    }
  }, [attemptedCount, totalQuestions, correctCount, sessionCompleted, onSessionComplete, buildSessionQuestions]);

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

  const rows = (equations) =>
    equations.map((eq, index) => (
      <Equation
        eq={eq}
        key={eq.id.toString()}
        onAnswerChange={handleAnswerChange}
        inputRef={index === 0 ? firstInputRef : undefined}
      />
    ));

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

        <div className="space-y-3">{rows(operation.equations)}</div>
        
        <hr className="border-indigo-200" />
        
        <div className="space-y-3">
          {/* Session Stats */}
          <div className="flex items-center justify-between rounded-2xl bg-white/60 p-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">⭐</span>
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-amber-600">
                  Stars Earned
                </p>
                <p className="text-xl font-bold text-amber-600">
                  {correctCount}
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
                  {correctCount}/{totalQuestions}
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
              <div className="text-4xl mb-2">🎉🌟🎉</div>
              <p className="text-lg font-bold text-green-700">
                Amazing job! You got {correctCount} out of {totalQuestions}!
              </p>
              <p className="text-sm text-green-600">
                {correctCount === totalQuestions 
                  ? "PERFECT SCORE! You're a math superstar! ⭐" 
                  : correctCount >= totalQuestions * 0.7 
                    ? "Great work! Keep practicing! 💪" 
                    : "Good effort! Practice makes perfect! 🌈"}
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
