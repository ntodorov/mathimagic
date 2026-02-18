const {
  DEFAULT_GRADE_BAND,
  DEFAULT_DIFFICULTY,
  DEFAULT_QUESTION_COUNT,
  resolveProfile,
} = require('./profiles');

function randomIntInclusive(min, max, rng = Math.random) {
  const ceilMin = Math.ceil(min);
  const floorMax = Math.floor(max);
  return Math.floor(rng() * (floorMax - ceilMin + 1)) + ceilMin;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function generateEquation({ operation, profile, id, rng = Math.random }) {
  const x = randomIntInclusive(profile.x.min, profile.x.max, rng);
  let y = randomIntInclusive(profile.y.min, profile.y.max, rng);

  if (operation === 'subtraction' && profile.enforceNonNegative) {
    y = clamp(y, profile.y.min, Math.min(x, profile.y.max));
  }

  switch (operation) {
    case 'addition':
      return { id, x, y, operation: profile.symbol, solution: x + y };
    case 'multiplication':
      return { id, x, y, operation: profile.symbol, solution: x * y };
    case 'subtraction':
    default:
      return { id, x, y, operation: profile.symbol, solution: x - y };
  }
}

function generateOperationSet({
  operation,
  gradeBand = DEFAULT_GRADE_BAND,
  difficulty = DEFAULT_DIFFICULTY,
  questionCount = DEFAULT_QUESTION_COUNT,
  rng = Math.random,
}) {
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
