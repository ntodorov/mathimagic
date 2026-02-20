function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function gcd(a, b) {
  let left = Math.abs(a);
  let right = Math.abs(b);
  while (right !== 0) {
    const next = left % right;
    left = right;
    right = next;
  }
  return left || 1;
}

function simplifyFraction(numerator, denominator) {
  if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator === 0) {
    return null;
  }
  const normalizedDenominator = denominator < 0 ? -denominator : denominator;
  const normalizedNumerator = denominator < 0 ? -numerator : numerator;
  const divisor = gcd(normalizedNumerator, normalizedDenominator);
  return {
    numerator: normalizedNumerator / divisor,
    denominator: normalizedDenominator / divisor,
  };
}

function parseFractionParts(value) {
  const raw = String(value ?? '').trim();
  const match = raw.match(/^(-?\d+)\s*\/\s*(-?\d+)$/);
  if (!match) {
    return null;
  }
  const numerator = Number(match[1]);
  const denominator = Number(match[2]);
  if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator === 0) {
    return null;
  }
  return denominator < 0
    ? { numerator: -numerator, denominator: -denominator }
    : { numerator, denominator };
}

function parseFraction(value) {
  const parts = parseFractionParts(value);
  if (!parts) {
    return null;
  }
  return simplifyFraction(parts.numerator, parts.denominator);
}

function parseDivisionRemainder(value) {
  const raw = String(value ?? '').trim();
  if (raw === '') {
    return null;
  }

  const quotientOnly = raw.match(/^(-?\d+)$/);
  if (quotientOnly) {
    return { quotient: Number(quotientOnly[1]), remainder: 0 };
  }

  const shorthand = raw.match(/^(-?\d+)\s*[rR]\s*(-?\d+)$/);
  if (shorthand) {
    return { quotient: Number(shorthand[1]), remainder: Number(shorthand[2]) };
  }

  const wordForm = raw.match(/^(-?\d+)\s+remainder\s+(-?\d+)$/i);
  if (wordForm) {
    return { quotient: Number(wordForm[1]), remainder: Number(wordForm[2]) };
  }

  return null;
}

function parseDecimal(value) {
  const raw = String(value ?? '').trim();
  if (!/^-?\d*(\.\d+)?$/.test(raw) || raw === '' || raw === '-' || raw === '.') {
    return null;
  }
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeYesNo(value) {
  const raw = String(value ?? '').trim().toLowerCase();
  if (['y', 'yes', 'true'].includes(raw)) {
    return 'yes';
  }
  if (['n', 'no', 'false'].includes(raw)) {
    return 'no';
  }
  return null;
}

function normalizeComparison(value) {
  const raw = String(value ?? '').trim();
  if (raw === '<' || raw === '>' || raw === '=') {
    return raw;
  }
  return null;
}

function normalizeChoice(value) {
  const raw = String(value ?? '').trim().toUpperCase();
  return /^[A-Z]$/.test(raw) ? raw : null;
}

function parseOrdering(value) {
  const raw = String(value ?? '').trim();
  if (raw === '') {
    return [];
  }
  const candidateParts = raw.includes(',')
    ? raw.split(',')
    : raw.split(/[<>]/);
  const parts = candidateParts.map((part) => part.trim()).filter(Boolean);
  return parts.map((part) => {
    const fraction = parseFraction(part);
    return fraction ? `${fraction.numerator}/${fraction.denominator}` : null;
  });
}

function inferAnswerType(question) {
  if (question?.answerType) {
    return question.answerType;
  }

  if (typeof question?.solution === 'number') {
    return 'number';
  }

  if (question?.solution && typeof question.solution === 'object') {
    if (Object.prototype.hasOwnProperty.call(question.solution, 'quotient')) {
      return 'remainder';
    }
    if (
      Object.prototype.hasOwnProperty.call(question.solution, 'numerator')
      && Object.prototype.hasOwnProperty.call(question.solution, 'denominator')
    ) {
      return 'fraction';
    }
  }

  return 'number';
}

function normalizeExpectedFraction(solution) {
  if (solution && typeof solution === 'object') {
    if (
      Object.prototype.hasOwnProperty.call(solution, 'numerator')
      && Object.prototype.hasOwnProperty.call(solution, 'denominator')
    ) {
      return simplifyFraction(Number(solution.numerator), Number(solution.denominator));
    }
  }

  if (typeof solution === 'string') {
    return parseFraction(solution);
  }

  return null;
}

function evaluateQuestionAnswer(question, rawValue) {
  const value = String(rawValue ?? '');
  const trimmed = value.trim();
  const answerType = inferAnswerType(question);

  if (trimmed === '') {
    return {
      value,
      normalizedValue: '',
      hasAnswer: false,
      isCorrect: false,
    };
  }

  switch (answerType) {
    case 'remainder': {
      const parsed = parseDivisionRemainder(trimmed);
      const solution = question?.solution ?? {};
      const expectedQuotient = toNumber(solution.quotient);
      const expectedRemainder = toNumber(solution.remainder);
      const isCorrect = Boolean(
        parsed
        && expectedQuotient !== null
        && expectedRemainder !== null
        && parsed.quotient === expectedQuotient
        && parsed.remainder === expectedRemainder
      );
      return {
        value,
        normalizedValue: parsed ? `${parsed.quotient} R${parsed.remainder}` : trimmed,
        hasAnswer: true,
        isCorrect,
      };
    }
    case 'fraction': {
      const parsedParts = parseFractionParts(trimmed);
      const parsed = parsedParts
        ? simplifyFraction(parsedParts.numerator, parsedParts.denominator)
        : null;
      const expected = normalizeExpectedFraction(question?.solution);
      const equivalent = Boolean(
        parsed
        && expected
        && parsed.numerator * expected.denominator === expected.numerator * parsed.denominator
      );
      const isCorrect = question?.acceptEquivalent === false
        ? Boolean(
          parsed
          && expected
          && equivalent
          && parsedParts.numerator === parsed.numerator
          && parsedParts.denominator === parsed.denominator
        )
        : equivalent;
      return {
        value,
        normalizedValue: parsed ? `${parsed.numerator}/${parsed.denominator}` : trimmed,
        hasAnswer: true,
        isCorrect,
      };
    }
    case 'decimal': {
      const parsed = parseDecimal(trimmed);
      const expected = toNumber(question?.solution);
      const tolerance = Number.isFinite(question?.decimalTolerance)
        ? Math.max(0, Number(question.decimalTolerance))
        : 0.0001;
      const isCorrect = parsed !== null && expected !== null && Math.abs(parsed - expected) <= tolerance;
      return {
        value,
        normalizedValue: parsed !== null ? String(parsed) : trimmed,
        hasAnswer: true,
        isCorrect,
      };
    }
    case 'comparison': {
      const normalized = normalizeComparison(trimmed);
      return {
        value,
        normalizedValue: normalized ?? trimmed,
        hasAnswer: true,
        isCorrect: normalized !== null && normalized === question?.solution,
      };
    }
    case 'yes-no': {
      const normalized = normalizeYesNo(trimmed);
      return {
        value,
        normalizedValue: normalized ?? trimmed.toLowerCase(),
        hasAnswer: true,
        isCorrect: normalized !== null && normalized === String(question?.solution ?? '').toLowerCase(),
      };
    }
    case 'choice': {
      const normalized = normalizeChoice(trimmed);
      return {
        value,
        normalizedValue: normalized ?? trimmed.toUpperCase(),
        hasAnswer: true,
        isCorrect: normalized !== null && normalized === String(question?.solution ?? '').toUpperCase(),
      };
    }
    case 'ordering': {
      const parsedList = parseOrdering(trimmed);
      const expectedList = Array.isArray(question?.solution)
        ? question.solution.map((token) => {
          const parsed = parseFraction(token);
          return parsed ? `${parsed.numerator}/${parsed.denominator}` : String(token).trim();
        })
        : [];
      const isCorrect = parsedList.length === expectedList.length
        && parsedList.every((item, index) => item && item === expectedList[index]);
      return {
        value,
        normalizedValue: parsedList.some((item) => item)
          ? parsedList.filter(Boolean).join(', ')
          : trimmed,
        hasAnswer: true,
        isCorrect,
      };
    }
    case 'number':
    default: {
      const parsed = toNumber(trimmed);
      const expected = toNumber(question?.solution);
      return {
        value,
        normalizedValue: parsed === null ? trimmed : String(parsed),
        hasAnswer: true,
        isCorrect: parsed !== null && expected !== null && parsed === expected,
      };
    }
  }
}

function formatCorrectAnswer(question) {
  if (question?.correctAnswerText) {
    return String(question.correctAnswerText);
  }

  const answerType = inferAnswerType(question);
  const solution = question?.solution;

  switch (answerType) {
    case 'remainder': {
      const quotient = toNumber(solution?.quotient);
      const remainder = toNumber(solution?.remainder);
      if (quotient === null || remainder === null) {
        return '';
      }
      return `${quotient} R${remainder}`;
    }
    case 'fraction': {
      const normalized = normalizeExpectedFraction(solution);
      return normalized ? `${normalized.numerator}/${normalized.denominator}` : '';
    }
    case 'decimal': {
      if (!Number.isFinite(solution)) {
        return '';
      }
      return Number(solution).toString();
    }
    case 'comparison':
    case 'yes-no':
    case 'choice':
      return String(solution ?? '');
    case 'ordering':
      return Array.isArray(solution) ? solution.join(' < ') : '';
    case 'number':
    default:
      return Number.isFinite(solution) ? String(solution) : String(solution ?? '');
  }
}

function buildReviewExplanation(question, userAnswer) {
  const answerType = inferAnswerType(question);
  const trimmedAnswer = String(userAnswer ?? '').trim();

  if (trimmedAnswer === '') {
    return 'Try answering every question, even if you are unsure.';
  }

  if (answerType === 'fraction') {
    const expected = normalizeExpectedFraction(question?.solution);
    const actual = parseFraction(trimmedAnswer);

    if (!actual) {
      return 'Use fraction format like numerator/denominator (example: 3/4).';
    }

    if (expected && actual.numerator === expected.denominator && actual.denominator === expected.numerator) {
      return 'Looks like numerator and denominator were swapped. Keep the dividend on top and divisor on bottom.';
    }

    if (
      expected
      && actual.numerator * expected.denominator === expected.numerator * actual.denominator
      && (actual.numerator !== expected.numerator || actual.denominator !== expected.denominator)
    ) {
      return 'Equivalent fraction found. Nice thinking, and simplify to lowest terms for full credit.';
    }

    return 'Match parts carefully: numerator counts selected parts, denominator counts equal parts in the whole.';
  }

  if (answerType === 'decimal') {
    const expected = toNumber(question?.solution);
    const actual = parseDecimal(trimmedAnswer);

    if (actual === null) {
      return 'Write decimal answers as numbers like 0.5 or 0.75.';
    }

    if (expected !== null && expected < 1 && actual >= 1) {
      return 'Decimal placement is off. For values less than one whole, keep the decimal before the first digit.';
    }

    if (
      expected !== null
      && (Math.abs(actual * 10 - expected) < 0.001 || Math.abs(actual / 10 - expected) < 0.001)
    ) {
      return 'Check place value: tenths and hundredths shift one digit at a time.';
    }

    return 'Convert the fraction to tenths or hundredths, then read that as a decimal.';
  }

  if (answerType === 'remainder') {
    const parsed = parseDivisionRemainder(trimmedAnswer);
    if (!parsed) {
      return 'Use quotient and remainder format like 3 R1.';
    }
    return 'Divide into equal groups first, then write leftovers as the remainder.';
  }

  if (answerType === 'comparison') {
    return 'Find a common denominator or decimal form, then compare the values.';
  }

  if (answerType === 'ordering') {
    return 'Convert fractions to comparable values, then list them from least to greatest.';
  }

  return 'Review the operation and try one step at a time.';
}

module.exports = {
  evaluateQuestionAnswer,
  formatCorrectAnswer,
  buildReviewExplanation,
  parseFraction,
  simplifyFraction,
};
