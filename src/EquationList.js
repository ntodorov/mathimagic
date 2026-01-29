import React from 'react';
import Equation from './Equation';

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

const DEFAULT_OPERATION = 'subtraction';
const OPERATION_OPTIONS = [
  { id: 'addition', label: 'Addition', symbol: '+' },
  { id: 'subtraction', label: 'Subtraction', symbol: '-' },
];

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

function buildOperation(type) {
  switch (type) {
    case 'addition':
      return createAdditionOperation();
    case 'subtraction':
    default:
      return createSubtractionOperation();
  }
}

const EquationList = ({ sectionId, focusSignal, onProgress, onSessionComplete, onNewSession }) => {
  const [operationType, setOperationType] = React.useState(DEFAULT_OPERATION);
  const [operation, setOperation] = React.useState(() => buildOperation(DEFAULT_OPERATION));
  const [answers, setAnswers] = React.useState({});
  const [sessionCompleted, setSessionCompleted] = React.useState(false);
  const firstInputRef = React.useRef(null);
  const operationTypeRef = React.useRef(operationType);

  React.useEffect(() => {
    operationTypeRef.current = operationType;
  }, [operationType]);

  const resetSession = React.useCallback((nextOperationType) => {
    const resolvedType = nextOperationType ?? operationTypeRef.current;
    setOperation(buildOperation(resolvedType));
    setAnswers({});
    setSessionCompleted(false);
    setTimeout(() => {
      firstInputRef.current?.focus({ preventScroll: true });
    }, 100);
  }, []);

  const handleOperationChange = React.useCallback((nextType) => {
    if (nextType === operationTypeRef.current) {
      return;
    }
    operationTypeRef.current = nextType;
    setOperationType(nextType);
    resetSession(nextType);
  }, [resetSession]);

  const handleAnswerChange = React.useCallback((id, payload) => {
    setAnswers((prev) => ({
      ...prev,
      [id]: payload,
    }));
  }, []);

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

  const totalQuestions = operation.equations.length;
  const answerEntries = Object.values(answers);
  const correctCount = answerEntries.filter((entry) => entry.isCorrect).length;
  const attemptedCount = answerEntries.filter((entry) => entry.hasAnswer).length;
  const progressValue = totalQuestions === 0 ? 0 : (correctCount / totalQuestions) * 100;

  const activeOption = OPERATION_OPTIONS.find((option) => option.id === operationType) ?? OPERATION_OPTIONS[0];

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
        onSessionComplete({
          correct: correctCount,
          attempted: totalQuestions,
        });
      }
    }
  }, [attemptedCount, totalQuestions, correctCount, sessionCompleted, onSessionComplete]);

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

        <div className="rounded-2xl bg-white/70 p-3">
          <p className="text-xs font-bold uppercase tracking-wide text-indigo-500">
            Choose a Challenge
          </p>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {OPERATION_OPTIONS.map((option) => {
              const isActive = option.id === operationType;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => handleOperationChange(option.id)}
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
    </section>
  );
};

export default EquationList;
