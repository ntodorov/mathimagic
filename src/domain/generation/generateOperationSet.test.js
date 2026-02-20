import { generateOperationSet } from './generateOperationSet';

describe('generateOperationSet', () => {
  test('creates deterministic addition output with injected rng', () => {
    const rng = jest.fn(() => 0);
    const result = generateOperationSet({ operation: 'addition', questionCount: 3, rng });

    expect(result.name).toBe('Addition');
    expect(result.type).toBe('addition');
    expect(result.profile).toEqual({ gradeBand: 'k-2', difficulty: 'easy' });
    expect(result.equations).toHaveLength(3);
    expect(result.equations[0]).toEqual(expect.objectContaining({
      id: 1,
      x: 1,
      y: 1,
      operation: '+',
      solution: 2,
      answerType: 'number',
      prompt: '1 + 1 =',
    }));
    expect(rng).toHaveBeenCalled();
  });

  test('keeps generated values inside configured multiplication ranges', () => {
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
      expect(eq.answerType).toBe('number');
    });
  });

  test('prioritizes adaptive weak facts for core operation sessions', () => {
    const result = generateOperationSet({
      operation: 'addition',
      questionCount: 5,
      rng: () => 0.99,
      adaptiveFacts: [
        { x: 7, y: 8, misses: 3, lastMissedAt: '2026-02-02T00:00:00.000Z' },
        { x: 2, y: 9, misses: 2, lastMissedAt: '2026-02-01T00:00:00.000Z' },
      ],
    });

    expect(result.adaptiveQuestionCount).toBe(2);
    expect(result.equations[0]).toEqual(expect.objectContaining({
      x: 7,
      y: 8,
      solution: 15,
      isAdaptive: true,
    }));
    expect(result.equations[1]).toEqual(expect.objectContaining({
      x: 2,
      y: 9,
      solution: 11,
      isAdaptive: true,
    }));
    expect(result.equations[2]).toEqual(expect.objectContaining({
      x: 10,
      y: 10,
    }));
    expect(result.equations[2]).not.toHaveProperty('isAdaptive');
  });

  test('generates division bridge questions with remainder scoring data', () => {
    const result = generateOperationSet({ operation: 'division-bridge', questionCount: 8, rng: () => 0 });

    result.equations.forEach((eq) => {
      expect(eq.answerType).toBe('remainder');
      expect(eq.solution).toEqual(expect.objectContaining({
        quotient: expect.any(Number),
        remainder: expect.any(Number),
      }));
      expect(eq.x).toBe((eq.y * eq.solution.quotient) + eq.solution.remainder);
      expect(eq.prompt).toMatch(/q R r/i);
      expect(eq.contextPrompt).toMatch(/shared among/i);
    });
  });

  test('generates fractions-as-division prompts with visual + symbolic support', () => {
    const result = generateOperationSet({ operation: 'fractions', questionCount: 3, rng: () => 0 });

    expect(result.equations[0]).toEqual(expect.objectContaining({
      answerType: 'fraction',
      solution: { numerator: 1, denominator: 2 },
      prompt: expect.stringMatching(/as a fraction/i),
      visualPrompt: expect.stringMatching(/1\/2/),
      correctAnswerText: '1/2',
      acceptEquivalent: false,
    }));
  });

  test('cycles fraction sense question types (equivalent, compare, order, number line)', () => {
    const result = generateOperationSet({ operation: 'fraction-sense', questionCount: 4, rng: () => 0 });

    expect(result.equations[0]).toEqual(expect.objectContaining({
      fractionSenseType: 'equivalent',
      answerType: 'yes-no',
    }));
    expect(result.equations[1]).toEqual(expect.objectContaining({
      fractionSenseType: 'compare',
      answerType: 'comparison',
    }));
    expect(result.equations[2]).toEqual(expect.objectContaining({
      fractionSenseType: 'order',
      answerType: 'ordering',
    }));
    expect(result.equations[3]).toEqual(expect.objectContaining({
      fractionSenseType: 'number-line',
      answerType: 'choice',
    }));
  });

  test('cycles decimals bridge conversions including money context', () => {
    const result = generateOperationSet({ operation: 'decimals-bridge', questionCount: 3, rng: () => 0 });

    expect(result.equations[0]).toEqual(expect.objectContaining({
      decimalBridgeType: 'fraction-to-decimal',
      answerType: 'decimal',
    }));
    expect(result.equations[1]).toEqual(expect.objectContaining({
      decimalBridgeType: 'decimal-to-fraction',
      answerType: 'fraction',
    }));
    expect(result.equations[2]).toEqual(expect.objectContaining({
      decimalBridgeType: 'money',
      answerType: 'decimal',
    }));
  });

  test('builds mixed mastery sets with operations, fractions, and decimals', () => {
    const result = generateOperationSet({ operation: 'mixed-mastery', questionCount: 10, rng: () => 0 });

    expect(result.type).toBe('mixed-mastery');
    expect(result.equations).toHaveLength(10);
    const sourceModes = new Set(result.equations.map((eq) => eq.sourceMode));

    expect([...sourceModes].some((mode) => ['addition', 'subtraction', 'multiplication', 'division', 'division-bridge'].includes(mode))).toBe(true);
    expect([...sourceModes].some((mode) => ['fractions', 'fraction-sense'].includes(mode))).toBe(true);
    expect(sourceModes.has('decimals-bridge')).toBe(true);
  });
});
