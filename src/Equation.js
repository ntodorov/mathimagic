import * as React from 'react';

function Equation(props) {
  const {
    eq,
    onAnswerChange,
    inputRef,
    value = '',
    onNext,
    enterKeyHint,
    nextLabel = 'Next',
  } = props;

  const trimmedValue = value.trim();
  const hasAnswer = trimmedValue !== '';
  const promptText = eq.prompt ?? `${eq.x} ${eq.operation} ${eq.y} =`;
  const supportsNumericInput = eq.answerType === 'number' || eq.answerType === 'decimal';
  const inputHintByAnswerType = {
    remainder: 'Type quotient R remainder (example: 3 R1)',
    fraction: 'Type numerator/denominator (example: 3/4)',
    comparison: 'Type <, >, or =',
    'yes-no': 'Type yes or no',
    choice: 'Type the letter choice',
    ordering: 'Type fractions in order, separated by commas',
    decimal: 'Type a decimal number',
  };
  const answerHint = inputHintByAnswerType[eq.answerType] ?? 'Type your answer';
  const inputWidthClass = supportsNumericInput ? 'w-24' : 'w-52 max-w-full';

  const handleChange = (e) => {
    const nextValue = e.target.value;
    onAnswerChange?.(eq.id, {
      value: nextValue,
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
          {promptText}
        </span>
        {eq.visualPrompt && (
          <p className="w-full text-sm font-semibold text-indigo-600">
            {eq.visualPrompt}
          </p>
        )}
        {eq.contextPrompt && (
          <p className="w-full text-sm text-slate-600">
            {eq.contextPrompt}
          </p>
        )}
        <input
          value={value}
          className={`${inputWidthClass} rounded-xl border-2 border-purple-300 bg-white px-3 py-2 text-center text-xl font-bold text-slate-900 focus-visible:ring-2 focus-visible:border-purple-400 focus-visible:ring-purple-200`}
          type="text"
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          ref={inputRef}
          autoComplete="off"
          inputMode={supportsNumericInput ? 'decimal' : 'text'}
          pattern={supportsNumericInput ? '[0-9.\\-]*' : undefined}
          enterKeyHint={enterKeyHint}
          aria-label={`Answer for question ${eq.id}: ${promptText}`}
          placeholder="?"
        />
      </div>
      <p className="mt-2 text-xs font-semibold text-slate-500">{answerHint}</p>
      {hasAnswer && onNext && (
        <p className="mt-2 text-xs font-semibold text-slate-500">
          {nextLabel === 'Done'
            ? 'Press Enter, swipe, or tap Done to finish.'
            : 'Press Enter, swipe, or tap Next to continue.'}
        </p>
      )}
    </div>
  );
}

export default React.memo(Equation);
