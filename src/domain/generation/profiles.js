const DEFAULT_GRADE_BAND = 'k-2';
const DEFAULT_DIFFICULTY = 'easy';
const DEFAULT_QUESTION_COUNT = 10;

const GRADE_BAND_OPTIONS = [
  { id: 'k-2', label: 'K-2' },
];

const DIFFICULTY_OPTIONS = [
  { id: 'easy', label: 'Easy' },
  { id: 'medium', label: 'Medium' },
  { id: 'hard', label: 'Hard' },
];

const OPERATION_PROFILE_CONFIG = {
  addition: {
    'k-2': {
      easy: {
        name: 'Addition',
        symbol: '+',
        x: { min: 1, max: 10 },
        y: { min: 1, max: 10 },
      },
      medium: {
        name: 'Addition',
        symbol: '+',
        x: { min: 5, max: 20 },
        y: { min: 5, max: 20 },
      },
      hard: {
        name: 'Addition',
        symbol: '+',
        x: { min: 10, max: 50 },
        y: { min: 10, max: 50 },
      },
    },
  },
  subtraction: {
    'k-2': {
      easy: {
        name: 'Subtraction',
        symbol: '-',
        x: { min: 2, max: 19 },
        y: { min: 1, max: 18 },
        enforceNonNegative: true,
      },
      medium: {
        name: 'Subtraction',
        symbol: '-',
        x: { min: 10, max: 50 },
        y: { min: 1, max: 40 },
        enforceNonNegative: true,
      },
      hard: {
        name: 'Subtraction',
        symbol: '-',
        x: { min: 15, max: 100 },
        y: { min: 1, max: 90 },
        enforceNonNegative: false,
      },
    },
  },
  multiplication: {
    'k-2': {
      easy: {
        name: 'Multiplication',
        symbol: '×',
        x: { min: 1, max: 10 },
        y: { min: 1, max: 10 },
      },
      medium: {
        name: 'Multiplication',
        symbol: '×',
        x: { min: 2, max: 12 },
        y: { min: 2, max: 12 },
      },
      hard: {
        name: 'Multiplication',
        symbol: '×',
        x: { min: 5, max: 20 },
        y: { min: 5, max: 20 },
      },
    },
  },
  division: {
    'k-2': {
      easy: {
        name: 'Division',
        symbol: '÷',
        divisor: { min: 1, max: 5 },
        quotient: { min: 1, max: 5 },
      },
      medium: {
        name: 'Division',
        symbol: '÷',
        divisor: { min: 2, max: 10 },
        quotient: { min: 2, max: 10 },
      },
      hard: {
        name: 'Division',
        symbol: '÷',
        divisor: { min: 2, max: 12 },
        quotient: { min: 2, max: 12 },
      },
    },
  },
  'division-bridge': {
    'k-2': {
      easy: {
        name: 'Division Bridge',
        symbol: '÷',
        divisor: { min: 2, max: 6 },
        quotient: { min: 1, max: 8 },
        remainder: { min: 0, max: 3 },
      },
      medium: {
        name: 'Division Bridge',
        symbol: '÷',
        divisor: { min: 3, max: 9 },
        quotient: { min: 2, max: 10 },
        remainder: { min: 0, max: 5 },
      },
      hard: {
        name: 'Division Bridge',
        symbol: '÷',
        divisor: { min: 4, max: 12 },
        quotient: { min: 2, max: 12 },
        remainder: { min: 0, max: 8 },
      },
    },
  },
  fractions: {
    'k-2': {
      easy: {
        name: 'Fractions',
        symbol: '/',
        divisorChoices: [2, 3, 4, 5, 6, 8],
        dividend: { min: 1, max: 16 },
      },
      medium: {
        name: 'Fractions',
        symbol: '/',
        divisorChoices: [2, 3, 4, 5, 6, 8, 10, 12],
        dividend: { min: 1, max: 24 },
      },
      hard: {
        name: 'Fractions',
        symbol: '/',
        divisorChoices: [2, 3, 4, 5, 6, 8, 10, 12],
        dividend: { min: 2, max: 36 },
      },
    },
  },
  'fraction-sense': {
    'k-2': {
      easy: {
        name: 'Fraction Sense',
        symbol: '≠',
        denominatorPool: [2, 3, 4, 6, 8],
      },
      medium: {
        name: 'Fraction Sense',
        symbol: '≠',
        denominatorPool: [2, 3, 4, 5, 6, 8, 10],
      },
      hard: {
        name: 'Fraction Sense',
        symbol: '≠',
        denominatorPool: [2, 3, 4, 5, 6, 8, 10, 12],
      },
    },
  },
  'decimals-bridge': {
    'k-2': {
      easy: {
        name: 'Decimals Bridge',
        symbol: '.',
        conversionFractions: [
          [1, 2],
          [1, 4],
          [3, 4],
          [1, 5],
          [2, 5],
          [1, 10],
          [3, 10],
        ],
      },
      medium: {
        name: 'Decimals Bridge',
        symbol: '.',
        conversionFractions: [
          [1, 2],
          [1, 4],
          [3, 4],
          [1, 5],
          [2, 5],
          [3, 5],
          [1, 8],
          [3, 8],
          [5, 8],
          [1, 10],
          [3, 10],
          [7, 10],
          [1, 20],
        ],
      },
      hard: {
        name: 'Decimals Bridge',
        symbol: '.',
        conversionFractions: [
          [1, 2],
          [1, 3],
          [2, 3],
          [1, 4],
          [3, 4],
          [1, 5],
          [2, 5],
          [3, 5],
          [4, 5],
          [1, 8],
          [3, 8],
          [5, 8],
          [7, 8],
          [1, 10],
          [3, 10],
          [7, 10],
          [1, 20],
          [3, 20],
        ],
      },
    },
  },
  'mixed-mastery': {
    'k-2': {
      easy: {
        name: 'Mixed Mastery',
        symbol: '★',
        blendModes: ['addition', 'subtraction', 'multiplication', 'division', 'fractions', 'decimals-bridge'],
      },
      medium: {
        name: 'Mixed Mastery',
        symbol: '★',
        blendModes: ['addition', 'subtraction', 'multiplication', 'division', 'division-bridge', 'fractions', 'fraction-sense', 'decimals-bridge'],
      },
      hard: {
        name: 'Mixed Mastery',
        symbol: '★',
        blendModes: ['addition', 'subtraction', 'multiplication', 'division', 'division-bridge', 'fractions', 'fraction-sense', 'decimals-bridge'],
      },
    },
  },
};

function resolveProfile(operation, gradeBand = DEFAULT_GRADE_BAND, difficulty = DEFAULT_DIFFICULTY) {
  const operationProfiles = OPERATION_PROFILE_CONFIG[operation];
  if (!operationProfiles) {
    throw new Error(`Unknown operation: ${operation}`);
  }

  const gradeBandProfiles = operationProfiles[gradeBand] ?? operationProfiles[DEFAULT_GRADE_BAND];
  if (!gradeBandProfiles) {
    throw new Error(`No profiles configured for operation ${operation}`);
  }

  return gradeBandProfiles[difficulty] ?? gradeBandProfiles[DEFAULT_DIFFICULTY];
}

module.exports = {
  DEFAULT_GRADE_BAND,
  DEFAULT_DIFFICULTY,
  DEFAULT_QUESTION_COUNT,
  GRADE_BAND_OPTIONS,
  DIFFICULTY_OPTIONS,
  OPERATION_PROFILE_CONFIG,
  resolveProfile,
};
