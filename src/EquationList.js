import React from 'react';
import Equation from './Equation';

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

function minus() {
  const operation = {};
  operation.name = 'Subtraction';
  operation.equations = [];

  while (operation.equations.length < 10) {
    const a = {};
    a.x = getRandomInt(2, 20);
    a.y = getRandomInt(1, a.x);
    a.operation = '-';
    a.solution = a.x - a.y;
    a.id = operation.equations.length + 1;
    operation.equations.push(a);
  }
  return operation;
}

const EquationList = ({ sectionId, focusSignal, onProgress, onSessionComplete, onNewSession }) => {
  const [operation, setOperation] = React.useState(() => minus());
  const [answers, setAnswers] = React.useState({});
  const [sessionCompleted, setSessionCompleted] = React.useState(false);
  const firstInputRef = React.useRef(null);

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
      setOperation(minus());
      setAnswers({});
      setSessionCompleted(false);
    }
  }, [onNewSession]);

  React.useEffect(() => {
    if (!focusSignal) {
      return;
    }
    setOperation(minus());
    setAnswers({});
    setSessionCompleted(false);
    setTimeout(() => {
      firstInputRef.current?.focus({ preventScroll: true });
    }, 100);
  }, [focusSignal]);

  const totalQuestions = operation.equations.length;
  const answerEntries = Object.values(answers);
  const correctCount = answerEntries.filter((entry) => entry.isCorrect).length;
  const attemptedCount = answerEntries.filter((entry) => entry.hasAnswer).length;
  const progressValue = totalQuestions === 0 ? 0 : (correctCount / totalQuestions) * 100;

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
              {operation.name} Challenge
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
