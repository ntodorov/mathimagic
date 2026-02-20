const {
  CORE_MODE_IDS,
  defaultCurriculumState,
  normalizeCurriculumState,
  deriveCurriculumState,
  isModeUnlocked,
} = require('./progression');

function buildSession({
  operationType,
  attempted = 6,
  correct = 5,
  completed = true,
  startedAt = '2026-01-01T00:00:00.000Z',
  endedAt = '2026-01-01T00:02:00.000Z',
}) {
  return {
    operationType,
    attempted,
    correct,
    completed,
    startedAt,
    endedAt,
  };
}

describe('curriculum progression', () => {
  test('default state starts with core modes unlocked', () => {
    const state = defaultCurriculumState();
    expect(state.unlockedModes).toEqual(CORE_MODE_IDS);
    expect(isModeUnlocked('addition', state)).toBe(true);
    expect(isModeUnlocked('fractions', state)).toBe(false);
  });

  test('unlocks division bridge after two mastery-level division sessions', () => {
    const sessions = [
      buildSession({ operationType: 'division', correct: 5 }),
      buildSession({ operationType: 'division', correct: 6 }),
    ];

    const state = deriveCurriculumState(sessions);

    expect(state.masteryByMode.division.mastered).toBe(true);
    expect(isModeUnlocked('division-bridge', state)).toBe(true);
    expect(isModeUnlocked('fractions', state)).toBe(false);
  });

  test('unlocks full post-division chain when each prerequisite is mastered', () => {
    const sessions = [
      buildSession({ operationType: 'division', correct: 6 }),
      buildSession({ operationType: 'division', correct: 5 }),
      buildSession({ operationType: 'division-bridge', correct: 6 }),
      buildSession({ operationType: 'division-bridge', correct: 5 }),
      buildSession({ operationType: 'fractions', correct: 6 }),
      buildSession({ operationType: 'fractions', correct: 5 }),
      buildSession({ operationType: 'fraction-sense', correct: 6 }),
      buildSession({ operationType: 'fraction-sense', correct: 5 }),
      buildSession({ operationType: 'decimals-bridge', correct: 6 }),
      buildSession({ operationType: 'decimals-bridge', correct: 5 }),
    ];

    const state = deriveCurriculumState(sessions);

    expect(isModeUnlocked('division-bridge', state)).toBe(true);
    expect(isModeUnlocked('fractions', state)).toBe(true);
    expect(isModeUnlocked('fraction-sense', state)).toBe(true);
    expect(isModeUnlocked('decimals-bridge', state)).toBe(true);
    expect(isModeUnlocked('mixed-mastery', state)).toBe(true);
  });

  test('tracks weak core modes by low accuracy', () => {
    const sessions = [
      buildSession({ operationType: 'addition', attempted: 8, correct: 4 }),
      buildSession({ operationType: 'subtraction', attempted: 4, correct: 2 }),
    ];

    const state = deriveCurriculumState(sessions);

    expect(state.weakModes).toContain('addition');
    expect(state.weakModes).not.toContain('subtraction');
  });

  test('normalization backfills core modes and sanitizes fields', () => {
    const normalized = normalizeCurriculumState({
      unlockedModes: ['fractions'],
      masteryByMode: {
        division: { attempted: 'bad', correct: -2, masteryHits: 3 },
      },
      weakModes: ['fractions', 1, null],
    });

    CORE_MODE_IDS.forEach((mode) => {
      expect(normalized.unlockedModes).toContain(mode);
    });
    expect(normalized.masteryByMode.division.attempted).toBe(0);
    expect(normalized.masteryByMode.division.correct).toBe(0);
    expect(normalized.weakModes).toEqual(['fractions']);
  });
});
