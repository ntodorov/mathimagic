const DEFAULT_GRADE_BAND = 'k-2';
const DEFAULT_DIFFICULTY = 'easy';
const DEFAULT_QUESTION_COUNT = 10;

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
  OPERATION_PROFILE_CONFIG,
  resolveProfile,
};
