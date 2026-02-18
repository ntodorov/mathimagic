const {
  OPERATION_PROFILE_CONFIG,
  resolveProfile,
  DEFAULT_GRADE_BAND,
  DEFAULT_DIFFICULTY,
} = require('./profiles');

describe('generation profiles', () => {
  test('defines profile entries for all supported operations', () => {
    expect(Object.keys(OPERATION_PROFILE_CONFIG).sort()).toEqual([
      'addition',
      'multiplication',
      'subtraction',
    ]);
  });

  test('resolves profile by operation/gradeBand/difficulty key', () => {
    const profile = resolveProfile('addition', 'k-2', 'easy');
    expect(profile).toEqual(expect.objectContaining({
      name: 'Addition',
      symbol: '+',
      x: { min: 1, max: 10 },
      y: { min: 1, max: 10 },
    }));
  });

  test('falls back to default grade and difficulty when missing', () => {
    const profile = resolveProfile('multiplication', 'unknown', 'unknown');
    const defaultProfile = resolveProfile('multiplication', DEFAULT_GRADE_BAND, DEFAULT_DIFFICULTY);
    expect(profile).toEqual(defaultProfile);
  });

  test('throws for unknown operation', () => {
    expect(() => resolveProfile('division')).toThrow(/Unknown operation/);
  });
});
