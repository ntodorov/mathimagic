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

const EquationList = ({ sectionId, focusSignal }) => {
  const [operation, setOperation] = React.useState(() => minus());
  const [answers, setAnswers] = React.useState({});
  const firstInputRef = React.useRef(null);

  const handleAnswerChange = React.useCallback((id, payload) => {
    setAnswers((prev) => ({
      ...prev,
      [id]: payload,
    }));
  }, []);

  const handleReset = React.useCallback(() => {
    setOperation(minus());
    setAnswers({});
  }, []);

  React.useEffect(() => {
    if (!focusSignal) {
      return;
    }

    firstInputRef.current?.focus({ preventScroll: true });
  }, [focusSignal]);

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

  return (
    <section
      id={sectionId}
      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
    >
      <div className="space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Practice
          </p>
          <h2 className="text-lg font-semibold text-slate-900">
            {operation.name}
          </h2>
        </div>
        <div className="space-y-3">{rows(operation.equations)}</div>
        <hr className="border-slate-200" />
        <div className="space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Streak
              </p>
              <p className="text-lg font-semibold text-slate-900">
                {correctCount}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Daily goal
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
              className="h-full rounded-full bg-indigo-500 transition-all"
              style={{ width: `${progressValue}%` }}
            />
          </div>
          <button
            type="button"
            className="text-sm font-semibold text-indigo-600 transition hover:text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            onClick={handleReset}
          >
            Start a new set
          </button>
        </div>
      </div>
    </section>
  );
};

export default EquationList;
