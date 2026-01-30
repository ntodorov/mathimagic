import * as React from 'react';

function Equation(props) {
  const {
    eq,
    onAnswerChange,
    inputRef,
    value = '',
    onNext,
    enterKeyHint,
  } = props;

  const trimmedValue = value.trim();
  const hasAnswer = trimmedValue !== '';

  const handleChange = (e) => {
    const nextValue = e.target.value;
    const trimmedNextValue = nextValue.trim();
    const nextHasAnswer = trimmedNextValue !== '';
    const nextIsCorrect = nextHasAnswer && Number(trimmedNextValue) === eq.solution;

    onAnswerChange?.(eq.id, {
      value: nextValue,
      hasAnswer: nextHasAnswer,
      isCorrect: nextIsCorrect,
    });
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      onNext?.(event.currentTarget.value);
    }
  };

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
      className="w-full rounded-2xl border-2 border-purple-200 bg-white px-4 py-3 shadow-sm transition-all"
    >
      <div className="flex items-center justify-between">
        <span 
          className={`inline-flex h-7 min-w-[1.75rem] items-center justify-center rounded-full bg-gradient-to-r ${colorClass} px-2 text-sm font-bold text-white shadow-sm`}
        >
          {eq.id}
        </span>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <span className="text-2xl font-bold text-slate-700">
          {eq.x} {eq.operation} {eq.y} =
        </span>
        <input
          value={value}
          className="w-20 rounded-xl border-2 border-purple-300 bg-white px-3 py-2 text-center text-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:border-purple-400 focus:ring-purple-200"
          type="tel"
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          ref={inputRef}
          autoComplete="off"
          inputMode="numeric"
          pattern="[0-9]*"
          enterKeyHint={enterKeyHint}
          aria-label={`Answer for question ${eq.id}`}
          placeholder="?"
        />
      </div>
      {hasAnswer && onNext && (
        <p className="mt-2 text-xs font-semibold text-slate-500">
          Press Enter, swipe, or tap Next to continue.
        </p>
      )}
    </div>
  );
}

export default React.memo(Equation);
