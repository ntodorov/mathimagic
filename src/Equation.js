import * as React from 'react';

const FeedbackIcon = ({ isError }) => {
  const label = isError ? 'feedback-icon-incorrect' : 'feedback-icon-correct';

  return (
    <span
      data-testid={label}
      className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold uppercase ${
        isError
          ? 'bg-rose-100 text-rose-700'
          : 'bg-emerald-100 text-emerald-700'
      }`}
      aria-hidden="true"
    >
      {isError ? 'X' : 'OK'}
    </span>
  );
};

function Equation(props) {
  const { eq, onAnswerChange, inputRef } = props;
  const [answer, setAnswer] = React.useState('');
  const [error, setError] = React.useState(false);

  React.useEffect(() => {
    setAnswer('');
    setError(false);
  }, [eq]);

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
  const feedbackText = hasAnswer ? (error ? 'Try again' : 'Nice job!') : '';

  return (
    <div className="w-full rounded-2xl border border-[#ffe6c7] bg-white/90 px-4 py-3 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="inline-flex h-6 min-w-[1.5rem] items-center justify-center rounded-full bg-[#fff0d9] px-2 text-xs font-semibold text-[#b45309]">
          {eq.id}
        </span>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="text-xl font-semibold text-slate-900">
          {eq.x} {eq.operation} {eq.y} =
        </span>
        <input
          value={answer}
          className={`w-20 rounded-xl border bg-white px-3 py-2 text-center text-lg font-semibold text-slate-900 focus:outline-none focus:ring-2 ${
            hasAnswer && error
              ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-200'
              : 'border-[#ffd6eb] focus:border-[#ff9ecd] focus:ring-[#ffd6eb]'
          }`}
          type="tel"
          onChange={handleChange}
          ref={inputRef}
          autoComplete="off"
          inputMode="numeric"
          pattern="[0-9]*"
          aria-label={`Answer for question ${eq.id}`}
        />
        {!hasAnswer ? null : <FeedbackIcon isError={error} />}
      </div>
      <p
        className={`mt-2 text-xs font-semibold ${
          error ? 'text-rose-600' : 'text-emerald-600'
        }`}
        aria-live="polite"
      >
        {feedbackText}
      </p>
    </div>
  );
}

export default React.memo(Equation);
