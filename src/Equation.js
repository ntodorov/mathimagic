import * as React from 'react';

const FeedbackIcon = ({ isError }) => {
  const label = isError ? 'feedback-icon-incorrect' : 'feedback-icon-correct';

  return (
    <span
      data-testid={label}
      className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-lg font-bold ${
        isError
          ? 'bg-rose-100 text-rose-600'
          : 'bg-green-100 text-green-600'
      }`}
      aria-hidden="true"
    >
      {isError ? '❌' : '⭐'}
    </span>
  );
};

function Equation(props) {
  const { eq, onAnswerChange, inputRef } = props;
  const [answer, setAnswer] = React.useState('');
  const [error, setError] = React.useState(false);

  const handleChange = (e) => {
    const nextValue = e.target.value;
    const trimmedValue = nextValue.trim();
    const hasAnswer = trimmedValue !== '';
    const isCorrect = hasAnswer && Number(trimmedValue) === eq.solution;

    setAnswer(nextValue);

    if (!hasAnswer) {
      setError(false);
      onAnswerChange?.(eq.id, {
        value: nextValue,
        hasAnswer,
        isCorrect,
      });
      return;
    }

    setError(!isCorrect);
    onAnswerChange?.(eq.id, {
      value: nextValue,
      hasAnswer,
      isCorrect,
    });
  };

  const hasAnswer = answer.trim() !== '';
  const isCorrect = hasAnswer && !error;
  const feedbackText = hasAnswer ? (error ? 'Try again! 💪' : 'Awesome! 🎉') : '';

  // Fun colors for each question number
  const numberColors = [
    'from-purple-400 to-purple-500',
    'from-pink-400 to-pink-500',
    'from-orange-400 to-orange-500',
    'from-yellow-400 to-amber-500',
    'from-green-400 to-green-500',
    'from-teal-400 to-teal-500',
    'from-blue-400 to-blue-500',
    'from-indigo-400 to-indigo-500',
    'from-violet-400 to-violet-500',
    'from-rose-400 to-rose-500',
  ];

  const colorClass = numberColors[(eq.id - 1) % numberColors.length];

  return (
    <div 
      className={`w-full rounded-2xl border-2 px-4 py-3 shadow-sm transition-all ${
        hasAnswer && isCorrect 
          ? 'border-green-300 bg-gradient-to-r from-green-50 to-teal-50' 
          : hasAnswer && error 
            ? 'border-rose-300 bg-gradient-to-r from-rose-50 to-orange-50'
            : 'border-purple-200 bg-white'
      }`}
    >
      <div className="flex items-center justify-between">
        <span 
          className={`inline-flex h-7 min-w-[1.75rem] items-center justify-center rounded-full bg-gradient-to-r ${colorClass} px-2 text-sm font-bold text-white shadow-sm`}
        >
          {eq.id}
        </span>
        {hasAnswer && <FeedbackIcon isError={error} />}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <span className="text-2xl font-bold text-slate-700">
          {eq.x} {eq.operation} {eq.y} =
        </span>
        <input
          value={answer}
          className={`w-20 rounded-xl border-2 px-3 py-2 text-center text-xl font-bold text-slate-900 focus:outline-none focus:ring-2 ${
            hasAnswer && error
              ? 'border-rose-300 bg-rose-50 focus:border-rose-400 focus:ring-rose-200'
              : hasAnswer && isCorrect
                ? 'border-green-300 bg-green-50 focus:border-green-400 focus:ring-green-200'
                : 'border-purple-300 bg-white focus:border-purple-400 focus:ring-purple-200'
          }`}
          type="tel"
          onChange={handleChange}
          ref={inputRef}
          autoComplete="off"
          inputMode="numeric"
          pattern="[0-9]*"
          aria-label={`Answer for question ${eq.id}`}
          placeholder="?"
        />
      </div>
      <p
        className={`mt-2 text-sm font-bold ${
          error ? 'text-rose-500' : 'text-green-500'
        }`}
        aria-live="polite"
      >
        {feedbackText}
      </p>
    </div>
  );
}

export default React.memo(Equation);
