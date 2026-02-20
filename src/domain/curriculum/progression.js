const CORE_MODE_IDS = ['addition', 'subtraction', 'multiplication', 'division'];

const CURRICULUM_UNLOCK_SEQUENCE = [
  { mode: 'division-bridge', prerequisite: 'division' },
  { mode: 'fractions', prerequisite: 'division-bridge' },
  { mode: 'fraction-sense', prerequisite: 'fractions' },
  { mode: 'decimals-bridge', prerequisite: 'fraction-sense' },
  { mode: 'mixed-mastery', prerequisite: 'decimals-bridge' },
];

const MASTERY_MIN_ACCURACY = 0.75;
const MASTERY_MIN_ATTEMPTED = 6;
const MASTERY_REQUIRED_HITS = 2;

const WEAK_MODE_MIN_ATTEMPTED = 5;
const WEAK_MODE_TARGET_ACCURACY = 0.75;

function coerceNonNegativeNumber(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return 0;
  }
  return parsed;
}

function normalizeModeStats(value) {
  const source = value && typeof value === 'object' ? value : {};
  const attempted = coerceNonNegativeNumber(source.attempted);
  const correct = coerceNonNegativeNumber(source.correct);
  const sessions = coerceNonNegativeNumber(source.sessions);
  const masteryHits = coerceNonNegativeNumber(source.masteryHits);
  const accuracy = attempted > 0 ? correct / attempted : 0;

  return {
    attempted,
    correct,
    sessions,
    masteryHits,
    accuracy,
    mastered: masteryHits >= MASTERY_REQUIRED_HITS,
    lastPracticedAt: source.lastPracticedAt ?? null,
  };
}

function defaultCurriculumState() {
  return {
    unlockedModes: [...CORE_MODE_IDS],
    masteryByMode: {},
    weakModes: [],
    thresholds: {
      masteryMinAccuracy: MASTERY_MIN_ACCURACY,
      masteryMinAttempted: MASTERY_MIN_ATTEMPTED,
      masteryRequiredHits: MASTERY_REQUIRED_HITS,
    },
    updatedAt: null,
  };
}

function normalizeCurriculumState(value) {
  const defaults = defaultCurriculumState();
  const source = value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  const unlockedModesSource = Array.isArray(source.unlockedModes) ? source.unlockedModes : [];
  const unlockedModes = new Set(CORE_MODE_IDS);
  unlockedModesSource.forEach((modeId) => {
    if (typeof modeId === 'string' && modeId.trim() !== '') {
      unlockedModes.add(modeId);
    }
  });

  const masterySource = source.masteryByMode && typeof source.masteryByMode === 'object'
    ? source.masteryByMode
    : {};
  const masteryByMode = {};
  Object.keys(masterySource).forEach((modeId) => {
    masteryByMode[modeId] = normalizeModeStats(masterySource[modeId]);
  });

  const weakModes = Array.isArray(source.weakModes)
    ? source.weakModes.filter((modeId) => typeof modeId === 'string')
    : [];

  return {
    ...defaults,
    unlockedModes: Array.from(unlockedModes),
    masteryByMode,
    weakModes,
    updatedAt: source.updatedAt ?? null,
  };
}

function calculateModeStatsFromSessions(sessions) {
  const modeTotals = {};

  sessions.forEach((session) => {
    const mode = typeof session.operationType === 'string' ? session.operationType : 'unknown';
    const attempted = coerceNonNegativeNumber(session.attempted);
    if (!modeTotals[mode]) {
      modeTotals[mode] = {
        attempted: 0,
        correct: 0,
        sessions: 0,
        masteryHits: 0,
        lastPracticedAt: null,
      };
    }
    const entry = modeTotals[mode];
    entry.attempted += attempted;
    entry.correct += coerceNonNegativeNumber(session.correct);
    entry.sessions += 1;

    const accuracy = attempted > 0 ? (coerceNonNegativeNumber(session.correct) / attempted) : 0;
    const sessionCountsForMastery = Boolean(session.completed)
      && attempted >= MASTERY_MIN_ATTEMPTED
      && accuracy >= MASTERY_MIN_ACCURACY;

    if (sessionCountsForMastery) {
      entry.masteryHits += 1;
    }

    const latestTimestamp = session.endedAt ?? session.startedAt ?? null;
    if (latestTimestamp && (!entry.lastPracticedAt || latestTimestamp > entry.lastPracticedAt)) {
      entry.lastPracticedAt = latestTimestamp;
    }
  });

  const normalized = {};
  Object.keys(modeTotals).forEach((modeId) => {
    normalized[modeId] = normalizeModeStats(modeTotals[modeId]);
  });
  return normalized;
}

function unlockModesFromMastery(masteryByMode) {
  const unlocked = new Set(CORE_MODE_IDS);

  CURRICULUM_UNLOCK_SEQUENCE.forEach(({ mode, prerequisite }) => {
    if (prerequisite === 'division') {
      const prerequisiteStats = masteryByMode.division;
      if (prerequisiteStats?.mastered) {
        unlocked.add(mode);
      }
      return;
    }

    if (unlocked.has(prerequisite) && masteryByMode[prerequisite]?.mastered) {
      unlocked.add(mode);
    }
  });

  return Array.from(unlocked);
}

function calculateWeakModes(masteryByMode, unlockedModes) {
  const unlockedSet = new Set(unlockedModes);
  return Object.entries(masteryByMode)
    .filter(([mode]) => unlockedSet.has(mode))
    .filter(([, stats]) => (
      stats.attempted >= WEAK_MODE_MIN_ATTEMPTED
      && stats.accuracy < WEAK_MODE_TARGET_ACCURACY
    ))
    .map(([mode]) => mode);
}

function deriveCurriculumState(sessions = [], previousState = null) {
  const normalizedPrevious = normalizeCurriculumState(previousState ?? defaultCurriculumState());
  const masteryByMode = calculateModeStatsFromSessions(Array.isArray(sessions) ? sessions : []);
  const unlockedModes = unlockModesFromMastery(masteryByMode);
  const weakModes = calculateWeakModes(masteryByMode, unlockedModes);

  return {
    ...normalizedPrevious,
    unlockedModes,
    masteryByMode,
    weakModes,
    updatedAt: new Date().toISOString(),
  };
}

function isModeUnlocked(modeId, curriculumState) {
  const normalized = normalizeCurriculumState(curriculumState);
  return normalized.unlockedModes.includes(modeId);
}

export {
  CORE_MODE_IDS,
  CURRICULUM_UNLOCK_SEQUENCE,
  MASTERY_MIN_ACCURACY,
  MASTERY_MIN_ATTEMPTED,
  MASTERY_REQUIRED_HITS,
  WEAK_MODE_MIN_ATTEMPTED,
  WEAK_MODE_TARGET_ACCURACY,
  defaultCurriculumState,
  normalizeCurriculumState,
  deriveCurriculumState,
  isModeUnlocked,
};
