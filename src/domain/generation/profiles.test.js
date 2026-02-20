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
      'decimals-bridge',
      'division',
      'division-bridge',
      'fraction-sense',
      'fractions',
      'mixed-mastery',
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

  test('resolves division profile with divisor and quotient ranges', () => {
    const profile = resolveProfile('division', 'k-2', 'easy');
    expect(profile).toEqual(expect.objectContaining({
      name: 'Division',
      symbol: '÷',
      divisor: { min: 1, max: 5 },
      quotient: { min: 1, max: 5 },
    }));
  });

  test('resolves post-division profiles', () => {
    const divisionBridge = resolveProfile('division-bridge', 'k-2', 'easy');
    const fractions = resolveProfile('fractions', 'k-2', 'easy');
    const fractionSense = resolveProfile('fraction-sense', 'k-2', 'easy');
    const decimalsBridge = resolveProfile('decimals-bridge', 'k-2', 'easy');
    const mixedMastery = resolveProfile('mixed-mastery', 'k-2', 'easy');

    expect(divisionBridge).toEqual(expect.objectContaining({
      name: 'Division Bridge',
      symbol: '÷',
      divisor: expect.any(Object),
      remainder: expect.any(Object),
    }));
    expect(fractions).toEqual(expect.objectContaining({
      name: 'Fractions',
      divisorChoices: expect.any(Array),
    }));
    expect(fractionSense).toEqual(expect.objectContaining({
      name: 'Fraction Sense',
      denominatorPool: expect.any(Array),
    }));
    expect(decimalsBridge).toEqual(expect.objectContaining({
      name: 'Decimals Bridge',
      conversionFractions: expect.any(Array),
    }));
    expect(mixedMastery).toEqual(expect.objectContaining({
      name: 'Mixed Mastery',
      blendModes: expect.any(Array),
    }));
  });

  test('throws for unknown operation', () => {
    expect(() => resolveProfile('modulo')).toThrow(/Unknown operation/);
  });
});
