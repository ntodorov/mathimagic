const { generateOperationSet } = require('./generateOperationSet');

describe('generateOperationSet', () => {
  test('creates deterministic output with injected rng', () => {
    const rng = jest.fn(() => 0);
    const result = generateOperationSet({ operation: 'addition', questionCount: 3, rng });

    expect(result).toEqual({
      name: 'Addition',
      type: 'addition',
      profile: { gradeBand: 'k-2', difficulty: 'easy' },
      equations: [
        { id: 1, x: 1, y: 1, operation: '+', solution: 2 },
        { id: 2, x: 1, y: 1, operation: '+', solution: 2 },
        { id: 3, x: 1, y: 1, operation: '+', solution: 2 },
      ],
    });
    expect(rng).toHaveBeenCalled();
  });

  test('keeps generated values inside configured ranges', () => {
    const result = generateOperationSet({ operation: 'multiplication', questionCount: 20, rng: () => 0.99 });

    result.equations.forEach((eq) => {
      expect(eq.x).toBeGreaterThanOrEqual(1);
      expect(eq.x).toBeLessThanOrEqual(10);
      expect(eq.y).toBeGreaterThanOrEqual(1);
      expect(eq.y).toBeLessThanOrEqual(10);
      expect(eq.solution).toBe(eq.x * eq.y);
    });
  });

  test('prevents negative subtraction answers by default', () => {
    const result = generateOperationSet({ operation: 'subtraction', questionCount: 25, rng: () => 0.01 });

    result.equations.forEach((eq) => {
      expect(eq.solution).toBeGreaterThanOrEqual(0);
      expect(eq.x).toBeGreaterThanOrEqual(eq.y);
    });
  });

  test('allows negative subtraction answers when configured profile opts out', () => {
    let callIndex = 0;
    const rng = () => {
      const value = callIndex % 2 === 0 ? 0 : 0.999;
      callIndex += 1;
      return value;
    };

    const result = generateOperationSet({
      operation: 'subtraction',
      difficulty: 'hard',
      questionCount: 15,
      rng,
    });

    expect(result.equations.some((eq) => eq.solution < 0)).toBe(true);
  });

  test('generates division equations with clean integer answers', () => {
    const result = generateOperationSet({ operation: 'division', questionCount: 20 });

    result.equations.forEach((eq) => {
      expect(eq.operation).toBe('÷');
      expect(Number.isInteger(eq.solution)).toBe(true);
      expect(eq.solution).toBeGreaterThanOrEqual(1);
      expect(eq.x).toBe(eq.y * eq.solution);
    });
  });

  test('creates deterministic division output with injected rng', () => {
    const rng = jest.fn(() => 0);
    const result = generateOperationSet({ operation: 'division', questionCount: 3, rng });

    expect(result).toEqual({
      name: 'Division',
      type: 'division',
      profile: { gradeBand: 'k-2', difficulty: 'easy' },
      equations: [
        { id: 1, x: 1, y: 1, operation: '÷', solution: 1 },
        { id: 2, x: 1, y: 1, operation: '÷', solution: 1 },
        { id: 3, x: 1, y: 1, operation: '÷', solution: 1 },
      ],
    });
  });
});
