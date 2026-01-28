import React from 'react';
import Equation from './Equation';

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}

function minus() {
  const operation = {};
  operation.name = 'Subtraction';
  operation.equations = [];

  while (operation.equations.length < 10) {
    const a = {};
    a.x = getRandomInt(2, 20); // Start from 2 to avoid zero result
    a.y = getRandomInt(1, a.x); // Ensure second operand is less than or equal to first
    a.operation = '-';
    a.solution = a.x - a.y;
    a.id = operation.equations.length + 1;
    operation.equations.push(a);
  }
  return operation;
}

const createEmptyOperation = () => ({
  name: 'Subtraction',
  equations: [],
});

const EquationList = ({
  sectionId,
  focusSignal = 0,
  startSignal = 0,
  isActive = true,
  playerName = 'friend',
}) => {
  const [operation, setOperation] = React.useState(() =>
    isActive ? minus() : createEmptyOperation()
  );
  const [answers, setAnswers] = React.useState({});
  const firstInputRef = React.useRef(null);

  const handleAnswerChange = React.useCallback((id, payload) => {
    setAnswers((prev) => ({
      ...prev,
      [id]: payload,
    }));
  }, []);

  const handleReset = React.useCallback(() => {
    if (!isActive) {
      return;
    }
    setOperation(minus());
    setAnswers({});
    firstInputRef.current?.focus({ preventScroll: true });
  }, [isActive]);

  React.useEffect(() => {
    if (!isActive) {
      setOperation(createEmptyOperation());
      setAnswers({});
      return;
    }
    setOperation(minus());
    setAnswers({});
  }, [isActive, startSignal]);

  React.useEffect(() => {
    if (!focusSignal || !isActive) {
      return;
    }

    if (operation.equations.length === 0) {
      return;
    }

    firstInputRef.current?.focus({ preventScroll: true });
  }, [focusSignal, isActive, operation.equations.length]);

  const rows = (equations) =>
    equations.map((eq, index) => (
      <Equation
        eq={eq}
        key={eq.id.toString()}
        onAnswerChange={handleAnswerChange}
        inputRef={index === 0 ? firstInputRef : undefined}
      />
    ));

  const totalQuestions = operation.equations.length;
  const answerEntries = Object.values(answers);
  const correctCount = answerEntries.filter((entry) => entry.isCorrect).length;
  const progressValue =
    totalQuestions === 0 ? 0 : (correctCount / totalQuestions) * 100;
  const trimmedName = playerName ? playerName.trim() : '';

  return (
    <section
      id={sectionId}
      className="rounded-3xl border border-[#ffd9a6] bg-white/80 p-5 shadow-[0_18px_50px_-40px_rgba(255,140,187,0.6)]"
    >
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              {isActive ? 'Session' : 'Warm-up'}
            </p>
            <h2 className="text-lg font-semibold text-slate-900">
              {operation.name}
            </h2>
          </div>
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              isActive
                ? 'bg-[#ffe0f1] text-[#c24180]'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            {isActive ? 'Session on' : 'Waiting'}
          </span>
        </div>
        {!isActive ? (
          <div className="space-y-2 rounded-2xl border border-dashed border-[#ffd5a8] bg-[#fffaf0] p-4 text-sm text-slate-700">
            <p className="text-base font-semibold text-slate-800">
              No questions yet.
            </p>
            <p className="text-sm text-slate-600">
              Tap &quot;Start session&quot; to get 10 subtraction puzzles
              {trimmedName ? `, ${trimmedName}.` : '.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">{rows(operation.equations)}</div>
        )}
        {isActive ? (
          <>
            <hr className="border-slate-200" />
            <div className="space-y-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Power streak
                  </p>
                  <p className="text-lg font-semibold text-slate-900">
                    {correctCount}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Session goal
                  </p>
                  <p className="text-lg font-semibold text-slate-900">
                    {correctCount}/{totalQuestions}
                  </p>
                </div>
              </div>
              <div
                className="h-2 w-full overflow-hidden rounded-full bg-slate-100"
                role="progressbar"
                aria-label="Session progress"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(progressValue)}
              >
                <div
                  className="h-full rounded-full bg-[#ff8ac4] transition-all"
                  style={{ width: `${progressValue}%` }}
                />
              </div>
              <button
                type="button"
                className="text-sm font-semibold text-[#ff6ea8] transition hover:text-[#ff4a98] focus:outline-none focus:ring-2 focus:ring-[#ffd1e8]"
                onClick={handleReset}
              >
                Mix up another set
              </button>
            </div>
          </>
        ) : null}
      </div>
    </section>
  );
};

export default EquationList;
