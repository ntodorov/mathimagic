const { deriveWeakFactsByOperation } = require('./weakFacts');

function buildQuestion(overrides = {}) {
  return {
    x: 2,
    y: 3,
    answerType: 'number',
    answer: '4',
    hasAnswer: true,
    isCorrect: false,
    ...overrides,
  };
}

describe('deriveWeakFactsByOperation', () => {
  test('collects and ranks weak facts from incorrect answered core questions', () => {
    const sessions = [
      {
        operationType: 'addition',
        endedAt: '2026-02-01T10:00:00.000Z',
        questions: [
          buildQuestion({ x: 2, y: 3 }),
          buildQuestion({ x: 4, y: 5, isCorrect: true }),
        ],
      },
      {
        operationType: 'mixed-mastery',
        endedAt: '2026-02-02T10:00:00.000Z',
        questions: [
          buildQuestion({ x: 3, y: 2, sourceMode: 'addition' }),
          buildQuestion({
            sourceMode: 'fractions',
            answerType: 'fraction',
            answer: '2/1',
          }),
          buildQuestion({ x: 9, y: 5, sourceMode: 'subtraction', answer: '1' }),
        ],
      },
    ];

    const weakFacts = deriveWeakFactsByOperation(sessions);

    expect(weakFacts.addition).toEqual([
      expect.objectContaining({ x: 2, y: 3, misses: 2, operationType: 'addition' }),
    ]);
    expect(weakFacts.subtraction).toEqual([
      expect.objectContaining({ x: 9, y: 5, misses: 1, operationType: 'subtraction' }),
    ]);
    expect(weakFacts.multiplication).toEqual([]);
    expect(weakFacts.division).toEqual([]);
  });

  test('ignores unanswered, malformed, and non-core data', () => {
    const sessions = [
      {
        operationType: 'fractions',
        questions: [buildQuestion()],
      },
      {
        operationType: 'addition',
        questions: [
          buildQuestion({ hasAnswer: false }),
          buildQuestion({ answer: '', hasAnswer: undefined }),
          buildQuestion({ isCorrect: undefined }),
          buildQuestion({ x: 'bad', y: 2 }),
          buildQuestion({ answerType: 'fraction' }),
        ],
      },
    ];

    const weakFacts = deriveWeakFactsByOperation(sessions);

    expect(weakFacts.addition).toEqual([]);
    expect(weakFacts.subtraction).toEqual([]);
    expect(weakFacts.multiplication).toEqual([]);
    expect(weakFacts.division).toEqual([]);
  });

  test('applies maxPerOperation limit after sorting by misses then recency', () => {
    const sessions = [
      {
        operationType: 'addition',
        endedAt: '2026-02-01T10:00:00.000Z',
        questions: [buildQuestion({ x: 1, y: 2 })],
      },
      {
        operationType: 'addition',
        endedAt: '2026-02-03T10:00:00.000Z',
        questions: [buildQuestion({ x: 4, y: 5 })],
      },
      {
        operationType: 'addition',
        endedAt: '2026-02-02T10:00:00.000Z',
        questions: [
          buildQuestion({ x: 1, y: 2 }),
          buildQuestion({ x: 1, y: 2 }),
        ],
      },
    ];

    const weakFacts = deriveWeakFactsByOperation(sessions, { maxPerOperation: 1 });

    expect(weakFacts.addition).toHaveLength(1);
    expect(weakFacts.addition[0]).toEqual(expect.objectContaining({ x: 1, y: 2, misses: 3 }));
  });
});
