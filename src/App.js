import * as React from 'react';
import EquationList from './EquationList';
import ButtonAppBar from './ButtonAppBar';

const PRACTICE_SECTION_ID = 'practice-section';

function App() {
  const [practiceFocusKey, setPracticeFocusKey] = React.useState(0);

  const handleStartPractice = React.useCallback(() => {
    setPracticeFocusKey((prev) => prev + 1);
    const practiceSection = document.getElementById(PRACTICE_SECTION_ID);
    practiceSection?.scrollIntoView?.({ behavior: 'smooth', block: 'start' });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f5f7ff] to-white text-slate-900">
      <ButtonAppBar />
      <main className="mx-auto w-full max-w-md px-4 pb-12 pt-6 sm:px-6">
        <div className="space-y-6">
          <section className="rounded-2xl border border-[#dbe4ff] bg-gradient-to-br from-[#e8f0ff] to-[#fdf3ff] p-6 shadow-sm">
            <div className="space-y-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
                  Math practice that feels like play
                </h1>
                <p className="text-base text-slate-600">
                  Short, joyful sessions that build confidence one answer at a
                  time.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {['Ages 6-10', '5-minute sessions', 'Phone-first design'].map(
                  (label) => (
                    <span
                      key={label}
                      className="inline-flex items-center rounded-full border border-slate-200 bg-white/70 px-3 py-1 text-xs font-medium text-slate-700"
                    >
                      {label}
                    </span>
                  )
                )}
              </div>
              <button
                type="button"
                className="inline-flex w-full items-center justify-center rounded-full bg-indigo-600 px-5 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                onClick={handleStartPractice}
                aria-controls={PRACTICE_SECTION_ID}
              >
                Start Practice
              </button>
            </div>
          </section>
          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="space-y-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                  Today's goal
                </p>
                <p className="text-lg font-semibold text-slate-900">
                  Complete 10 questions
                </p>
              </div>
              <div
                className="h-2 w-full overflow-hidden rounded-full bg-slate-100"
                role="progressbar"
                aria-label="Practice progress"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={0}
              >
                <div
                  className="h-full rounded-full bg-indigo-500 transition-all"
                  style={{ width: '0%' }}
                />
              </div>
              <p className="text-xs font-medium text-slate-500">
                0 of 10 completed
              </p>
            </div>
          </section>
          <EquationList
            sectionId={PRACTICE_SECTION_ID}
            focusSignal={practiceFocusKey}
          />
        </div>
      </main>
    </div>
  );
}

export default App;
