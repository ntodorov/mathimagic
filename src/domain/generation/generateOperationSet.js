const {
  DEFAULT_GRADE_BAND,
  DEFAULT_DIFFICULTY,
  DEFAULT_QUESTION_COUNT,
  resolveProfile,
} = require('./profiles');
const { simplifyFraction } = require('./answers');

function randomIntInclusive(min, max, rng = Math.random) {
  const ceilMin = Math.ceil(min);
  const floorMax = Math.floor(max);
  return Math.floor(rng() * (floorMax - ceilMin + 1)) + ceilMin;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function pickOne(list, rng = Math.random) {
  if (!Array.isArray(list) || list.length === 0) {
    return null;
  }
  const index = randomIntInclusive(0, list.length - 1, rng);
  return list[index];
}

function formatFractionValue(fraction) {
  if (!fraction) {
    return '';
  }
  return `${fraction.numerator}/${fraction.denominator}`;
}

function buildFractionBar(numerator, denominator) {
  const cappedDenominator = clamp(denominator, 1, 12);
  const fillCount = clamp(Math.round((numerator / denominator) * cappedDenominator), 0, cappedDenominator);
  return `${'■'.repeat(fillCount)}${'□'.repeat(cappedDenominator - fillCount)}`;
}

function fractionToDecimalString(value) {
  if (!Number.isFinite(value)) {
    return '';
  }
  const fixed = value.toFixed(4);
  return fixed.replace(/\.?0+$/, '');
}

function generateDivisionEquation({ profile, id, rng = Math.random }) {
  const divisor = randomIntInclusive(profile.divisor.min, profile.divisor.max, rng);
  const quotient = randomIntInclusive(profile.quotient.min, profile.quotient.max, rng);
  const dividend = divisor * quotient;
  return {
    id,
    x: dividend,
    y: divisor,
    operation: profile.symbol,
    solution: quotient,
    answerType: 'number',
    prompt: `${dividend} ${profile.symbol} ${divisor} =`,
  };
}

function generateDivisionBridgeEquation({ profile, id, rng = Math.random }) {
  const divisor = randomIntInclusive(profile.divisor.min, profile.divisor.max, rng);
  const quotient = randomIntInclusive(profile.quotient.min, profile.quotient.max, rng);
  const maxRemainder = Math.min(divisor - 1, profile.remainder.max);
  const remainder = randomIntInclusive(profile.remainder.min, Math.max(profile.remainder.min, maxRemainder), rng);
  const dividend = (divisor * quotient) + remainder;
  const people = ['kids', 'friends', 'teammates', 'classmates'];
  const objects = ['stickers', 'cookies', 'markers', 'marbles'];
  const sharingPrompt = `${dividend} ${pickOne(objects, rng)} shared among ${divisor} ${pickOne(people, rng)}.`;

  return {
    id,
    x: dividend,
    y: divisor,
    operation: '÷',
    solution: { quotient, remainder },
    answerType: 'remainder',
    prompt: `${dividend} ÷ ${divisor} = ? (q R r)`,
    contextPrompt: `${sharingPrompt} How many each and how many left over?`,
    correctAnswerText: `${quotient} R${remainder}`,
  };
}

function generateFractionsEquation({ profile, id, rng = Math.random }) {
  const divisor = pickOne(profile.divisorChoices, rng);
  const dividend = randomIntInclusive(profile.dividend.min, profile.dividend.max, rng);
  const simplified = simplifyFraction(dividend, divisor);
  const visualBar = buildFractionBar(simplified.numerator, simplified.denominator);

  return {
    id,
    x: dividend,
    y: divisor,
    operation: '÷',
    solution: simplified,
    answerType: 'fraction',
    acceptEquivalent: false,
    prompt: `Write ${dividend} ÷ ${divisor} as a fraction in simplest form.`,
    visualPrompt: `${visualBar} (${simplified.numerator}/${simplified.denominator})`,
    correctAnswerText: formatFractionValue(simplified),
  };
}

function buildComparableFractions(denominatorPool, rng = Math.random) {
  const denominatorA = pickOne(denominatorPool, rng) || 2;
  const denominatorB = pickOne(denominatorPool, rng) || 3;
  const numeratorA = randomIntInclusive(1, Math.max(1, denominatorA - 1), rng);
  const numeratorB = randomIntInclusive(1, Math.max(1, denominatorB - 1), rng);
  const fractionA = simplifyFraction(numeratorA, denominatorA);
  const fractionB = simplifyFraction(numeratorB, denominatorB);
  return {
    fractionA,
    fractionB,
    valueA: fractionA.numerator / fractionA.denominator,
    valueB: fractionB.numerator / fractionB.denominator,
  };
}

function generateEquivalentFractionSense({ profile, id, rng = Math.random }) {
  const denominator = pickOne(profile.denominatorPool, rng) || 2;
  const numerator = randomIntInclusive(1, Math.max(1, denominator - 1), rng);
  const multiplier = randomIntInclusive(2, 3, rng);
  const equivalent = rng() > 0.45;
  const left = simplifyFraction(numerator, denominator);
  const right = equivalent
    ? simplifyFraction(numerator * multiplier, denominator * multiplier)
    : simplifyFraction((numerator * multiplier) + 1, denominator * multiplier);

  return {
    id,
    answerType: 'yes-no',
    solution: equivalent ? 'yes' : 'no',
    prompt: `Are ${formatFractionValue(left)} and ${formatFractionValue(right)} equivalent? (yes/no)`,
    visualPrompt: 'Think: do they cover the same amount of the whole?',
    correctAnswerText: equivalent ? 'yes' : 'no',
    fractionSenseType: 'equivalent',
  };
}

function generateCompareFractionSense({ profile, id, rng = Math.random }) {
  const { fractionA, fractionB, valueA, valueB } = buildComparableFractions(profile.denominatorPool, rng);
  const solution = valueA === valueB ? '=' : valueA > valueB ? '>' : '<';

  return {
    id,
    answerType: 'comparison',
    solution,
    prompt: `Compare ${formatFractionValue(fractionA)} and ${formatFractionValue(fractionB)} using <, >, or =`,
    visualPrompt: 'Find common denominators or convert to decimals first.',
    correctAnswerText: solution,
    fractionSenseType: 'compare',
  };
}

function generateOrderFractionSense({ profile, id, rng = Math.random }) {
  const allCandidates = [];
  (profile.denominatorPool || [2, 3, 4]).forEach((denominator) => {
    for (let numerator = 1; numerator < denominator; numerator += 1) {
      allCandidates.push(simplifyFraction(numerator, denominator));
    }
  });

  const deduped = [];
  const seen = new Set();
  allCandidates.forEach((fraction) => {
    const key = formatFractionValue(fraction);
    if (!seen.has(key)) {
      seen.add(key);
      deduped.push(fraction);
    }
  });

  const startIndex = randomIntInclusive(0, Math.max(0, deduped.length - 1), rng);
  const rotated = deduped.slice(startIndex).concat(deduped.slice(0, startIndex));
  const candidates = rotated.slice(0, 3);

  const sorted = [...candidates].sort((a, b) => (a.numerator / a.denominator) - (b.numerator / b.denominator));
  const shuffled = [...sorted].sort(() => rng() - 0.5);

  return {
    id,
    answerType: 'ordering',
    solution: sorted.map((fraction) => formatFractionValue(fraction)),
    prompt: `Order least to greatest: ${shuffled.map((fraction) => formatFractionValue(fraction)).join(', ')}`,
    visualPrompt: 'Answer format: a/b, c/d, e/f',
    correctAnswerText: sorted.map((fraction) => formatFractionValue(fraction)).join(' < '),
    fractionSenseType: 'order',
  };
}

function generateNumberLineFractionSense({ profile, id, rng = Math.random }) {
  const denominator = pickOne(profile.denominatorPool, rng) || 4;
  const candidateNumerators = [1, 2, 3]
    .map((value) => clamp(value, 1, Math.max(1, denominator - 1)));
  const candidates = candidateNumerators.map((numerator) => simplifyFraction(numerator, denominator));
  const labels = ['A', 'B', 'C'];
  const targetIndex = randomIntInclusive(0, labels.length - 1, rng);
  const targetLabel = labels[targetIndex];
  const targetFraction = candidates[targetIndex];

  return {
    id,
    answerType: 'choice',
    solution: targetLabel,
    prompt: `On the number line 0-${labels[0]}-${labels[1]}-${labels[2]}-1, which point is ${formatFractionValue(targetFraction)}?`,
    visualPrompt: labels.map((label, index) => `${label}:${formatFractionValue(candidates[index])}`).join(' | '),
    correctAnswerText: targetLabel,
    fractionSenseType: 'number-line',
  };
}

function generateFractionSenseEquation({ profile, id, rng = Math.random }) {
  const patternIndex = (id - 1) % 4;
  switch (patternIndex) {
    case 0:
      return generateEquivalentFractionSense({ profile, id, rng });
    case 1:
      return generateCompareFractionSense({ profile, id, rng });
    case 2:
      return generateOrderFractionSense({ profile, id, rng });
    case 3:
    default:
      return generateNumberLineFractionSense({ profile, id, rng });
  }
}

function generateDecimalFractionConversion({ profile, id, rng = Math.random }) {
  const selected = pickOne(profile.conversionFractions, rng) || [1, 2];
  const simplified = simplifyFraction(selected[0], selected[1]);
  const decimalValue = simplified.numerator / simplified.denominator;

  return {
    id,
    answerType: 'decimal',
    solution: decimalValue,
    decimalTolerance: 0.0001,
    prompt: `Convert ${formatFractionValue(simplified)} to a decimal.`,
    visualPrompt: 'Think in tenths or hundredths.',
    correctAnswerText: fractionToDecimalString(decimalValue),
    decimalBridgeType: 'fraction-to-decimal',
  };
}

function generateDecimalToFractionConversion({ profile, id, rng = Math.random }) {
  const selected = pickOne(profile.conversionFractions, rng) || [1, 2];
  const simplified = simplifyFraction(selected[0], selected[1]);
  const decimalValue = simplified.numerator / simplified.denominator;

  return {
    id,
    answerType: 'fraction',
    solution: simplified,
    acceptEquivalent: false,
    prompt: `Convert ${fractionToDecimalString(decimalValue)} to a fraction in simplest form.`,
    visualPrompt: 'Write decimal as part of 10 or 100, then simplify.',
    correctAnswerText: formatFractionValue(simplified),
    decimalBridgeType: 'decimal-to-fraction',
  };
}

function generateMoneyDecimalBridge({ id, rng = Math.random }) {
  const moneyFractions = [
    [1, 2],
    [1, 4],
    [3, 4],
    [1, 5],
    [2, 5],
    [3, 5],
    [4, 5],
  ];
  const selected = pickOne(moneyFractions, rng) || [1, 2];
  const simplified = simplifyFraction(selected[0], selected[1]);
  const decimalValue = simplified.numerator / simplified.denominator;
  const cents = Math.round(decimalValue * 100);

  return {
    id,
    answerType: 'decimal',
    solution: decimalValue,
    decimalTolerance: 0.0001,
    prompt: `A snack costs ${cents} cents. Write the cost in dollars as a decimal.`,
    visualPrompt: `Money context: ${cents}¢ out of $1.00`,
    correctAnswerText: fractionToDecimalString(decimalValue),
    decimalBridgeType: 'money',
  };
}

function generateDecimalsBridgeEquation({ profile, id, rng = Math.random }) {
  const patternIndex = (id - 1) % 3;
  if (patternIndex === 0) {
    return generateDecimalFractionConversion({ profile, id, rng });
  }
  if (patternIndex === 1) {
    return generateDecimalToFractionConversion({ profile, id, rng });
  }
  return generateMoneyDecimalBridge({ id, rng });
}

function generateEquation({ operation, profile, id, rng = Math.random, inMixedMode = false }) {
  if (operation === 'division') {
    return generateDivisionEquation({ profile, id, rng });
  }

  if (operation === 'division-bridge') {
    return generateDivisionBridgeEquation({ profile, id, rng });
  }

  if (operation === 'fractions') {
    return generateFractionsEquation({ profile, id, rng });
  }

  if (operation === 'fraction-sense') {
    return generateFractionSenseEquation({ profile, id, rng });
  }

  if (operation === 'decimals-bridge') {
    return generateDecimalsBridgeEquation({ profile, id, rng });
  }

  const x = randomIntInclusive(profile.x.min, profile.x.max, rng);
  let y = randomIntInclusive(profile.y.min, profile.y.max, rng);

  if (operation === 'subtraction' && profile.enforceNonNegative) {
    y = clamp(y, profile.y.min, Math.min(x, profile.y.max));
  }

  let solution = x - y;
  if (operation === 'addition') {
    solution = x + y;
  } else if (operation === 'multiplication') {
    solution = x * y;
  }

  const baseQuestion = {
    id,
    x,
    y,
    operation: profile.symbol,
    solution,
    answerType: 'number',
    prompt: `${x} ${profile.symbol} ${y} =`,
  };

  if (inMixedMode) {
    return {
      ...baseQuestion,
      sourceMode: operation,
    };
  }

  return baseQuestion;
}

function generateMixedMasterySet({
  gradeBand = DEFAULT_GRADE_BAND,
  difficulty = DEFAULT_DIFFICULTY,
  questionCount = DEFAULT_QUESTION_COUNT,
  rng = Math.random,
}) {
  const profile = resolveProfile('mixed-mastery', gradeBand, difficulty);
  const blendModes = Array.isArray(profile.blendModes) ? profile.blendModes : [];
  const availableCoreModes = blendModes.filter((mode) => (
    ['addition', 'subtraction', 'multiplication', 'division', 'division-bridge'].includes(mode)
  ));
  const availableFractionModes = blendModes.filter((mode) => ['fractions', 'fraction-sense'].includes(mode));
  const availableDecimalModes = blendModes.filter((mode) => ['decimals-bridge'].includes(mode));

  const selectedModes = [];
  if (availableCoreModes.length > 0) {
    selectedModes.push(pickOne(availableCoreModes, rng));
  }
  if (availableFractionModes.length > 0) {
    selectedModes.push(pickOne(availableFractionModes, rng));
  }
  if (availableDecimalModes.length > 0) {
    selectedModes.push(pickOne(availableDecimalModes, rng));
  }

  while (selectedModes.length < questionCount) {
    selectedModes.push(pickOne(blendModes, rng) || 'addition');
  }

  const equations = selectedModes.slice(0, questionCount).map((mode, index) => {
    const modeProfile = resolveProfile(mode, gradeBand, difficulty);
    const question = generateEquation({
      operation: mode,
      profile: modeProfile,
      id: index + 1,
      rng,
      inMixedMode: true,
    });
    return {
      ...question,
      sourceMode: mode,
    };
  });

  return {
    name: profile.name,
    type: 'mixed-mastery',
    equations,
    profile: {
      gradeBand,
      difficulty,
    },
  };
}

function generateOperationSet({
  operation,
  gradeBand = DEFAULT_GRADE_BAND,
  difficulty = DEFAULT_DIFFICULTY,
  questionCount = DEFAULT_QUESTION_COUNT,
  rng = Math.random,
}) {
  if (operation === 'mixed-mastery') {
    return generateMixedMasterySet({ gradeBand, difficulty, questionCount, rng });
  }

  const profile = resolveProfile(operation, gradeBand, difficulty);
  const equations = [];

  for (let index = 0; index < questionCount; index += 1) {
    equations.push(generateEquation({ operation, profile, id: index + 1, rng }));
  }

  return {
    name: profile.name,
    type: operation,
    equations,
    profile: {
      gradeBand,
      difficulty,
    },
  };
}

module.exports = {
  generateOperationSet,
  generateEquation,
  randomIntInclusive,
};
