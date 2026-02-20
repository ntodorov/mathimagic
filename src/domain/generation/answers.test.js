const {
  evaluateQuestionAnswer,
  formatCorrectAnswer,
  buildReviewExplanation,
} = require('./answers');

describe('question answer evaluation', () => {
  test('evaluates remainder answers using quotient + remainder format', () => {
    const question = {
      answerType: 'remainder',
      solution: { quotient: 3, remainder: 1 },
    };

    expect(evaluateQuestionAnswer(question, '3 R1')).toEqual(expect.objectContaining({
      hasAnswer: true,
      isCorrect: true,
      normalizedValue: '3 R1',
    }));
    expect(evaluateQuestionAnswer(question, '3 R0').isCorrect).toBe(false);
  });

  test('requires simplest form when equivalent fractions are not accepted', () => {
    const question = {
      answerType: 'fraction',
      solution: { numerator: 1, denominator: 2 },
      acceptEquivalent: false,
    };

    expect(evaluateQuestionAnswer(question, '2/4').isCorrect).toBe(false);
    expect(evaluateQuestionAnswer(question, '1/2').isCorrect).toBe(true);
  });

  test('evaluates decimal answers with tolerance and supports formatting', () => {
    const question = {
      answerType: 'decimal',
      solution: 0.75,
    };

    expect(evaluateQuestionAnswer(question, '0.7500').isCorrect).toBe(true);
    expect(evaluateQuestionAnswer(question, '7.5').isCorrect).toBe(false);
    expect(formatCorrectAnswer(question)).toBe('0.75');
  });

  test('evaluates ordering answers from comma-separated fractions', () => {
    const question = {
      answerType: 'ordering',
      solution: ['1/4', '1/2', '3/4'],
    };

    expect(evaluateQuestionAnswer(question, '1/4, 1/2, 3/4').isCorrect).toBe(true);
    expect(evaluateQuestionAnswer(question, '3/4,1/2,1/4').isCorrect).toBe(false);
  });

  test('builds focused explanations for fraction and decimal mistakes', () => {
    const fractionQuestion = {
      answerType: 'fraction',
      solution: { numerator: 3, denominator: 4 },
    };
    const decimalQuestion = {
      answerType: 'decimal',
      solution: 0.5,
    };

    expect(buildReviewExplanation(fractionQuestion, '4/3')).toMatch(/swapped/i);
    expect(buildReviewExplanation(decimalQuestion, '5')).toMatch(/placement/i);
  });
});
