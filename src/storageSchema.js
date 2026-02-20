import {
  defaultCurriculumState,
  normalizeCurriculumState,
} from './domain/curriculum/progression';

const STORAGE_SCHEMA_VERSION = 1;

const RESULTS_KEY = 'mathimagic_results';
const SESSIONS_KEY = 'mathimagic_sessions';
const CURRICULUM_STATE_KEY = 'mathimagic_curriculum_state';

export const storageKeys = {
  RESULTS_KEY,
  SESSIONS_KEY,
  CURRICULUM_STATE_KEY,
};

export function defaultResults() {
  return { totalCorrect: 0, totalAttempted: 0, sessionsCompleted: 0 };
}

function safeParse(rawValue) {
  if (typeof rawValue !== 'string') {
    return null;
  }
  try {
    return JSON.parse(rawValue);
  } catch {
    return null;
  }
}

function isVersionedEnvelope(value) {
  return Boolean(
    value
      && typeof value === 'object'
      && !Array.isArray(value)
      && typeof value.version === 'number'
      && Object.prototype.hasOwnProperty.call(value, 'data')
  );
}

function coerceNonNegativeNumber(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return 0;
  }
  return parsed;
}

export function normalizeResults(value) {
  const source = value && typeof value === 'object' && !Array.isArray(value)
    ? value
    : defaultResults();

  return {
    totalCorrect: coerceNonNegativeNumber(source.totalCorrect),
    totalAttempted: coerceNonNegativeNumber(source.totalAttempted),
    sessionsCompleted: coerceNonNegativeNumber(source.sessionsCompleted),
  };
}

function normalizeQuestions(questions) {
  if (!Array.isArray(questions)) {
    return [];
  }
  return questions
    .filter((question) => question && typeof question === 'object')
    .map((question) => ({
      ...question,
      perQuestionDurationMs: coerceNonNegativeNumber(question.perQuestionDurationMs),
      firstShownAt: question.firstShownAt ?? null,
    }));
}

function normalizeSession(value, index = 0) {
  const source = value && typeof value === 'object' && !Array.isArray(value) ? value : {};

  const attempted = coerceNonNegativeNumber(source.attempted);
  const correct = coerceNonNegativeNumber(source.correct);
  const total = coerceNonNegativeNumber(source.total) || attempted;

  return {
    ...source,
    id: source.id ?? `legacy-${index}`,
    operationType: typeof source.operationType === 'string' ? source.operationType : 'unknown',
    correct,
    attempted,
    total,
    completed: Boolean(source.completed),
    startedAt: source.startedAt ?? null,
    endedAt: source.endedAt ?? null,
    durationMs: coerceNonNegativeNumber(source.durationMs),
    questions: normalizeQuestions(source.questions),
  };
}

export function normalizeSessions(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((session) => session && typeof session === 'object')
    .map((session, index) => normalizeSession(session, index));
}

function migrateLegacyValue(key, parsedValue) {
  if (key === RESULTS_KEY) {
    return normalizeResults(parsedValue);
  }
  if (key === SESSIONS_KEY) {
    return normalizeSessions(parsedValue);
  }
  if (key === CURRICULUM_STATE_KEY) {
    return normalizeCurriculumState(parsedValue);
  }
  return parsedValue;
}

function migrateVersionedValue(key, version, data) {
  // Version 1 is the first explicit storage schema. Older values are treated as legacy.
  if (version <= STORAGE_SCHEMA_VERSION) {
    return migrateLegacyValue(key, data);
  }

  // If we ever read a future version payload, only accept it if it can be normalized.
  return migrateLegacyValue(key, data);
}

function persistVersioned(localStorageRef, key, data) {
  localStorageRef.setItem(key, JSON.stringify({ version: STORAGE_SCHEMA_VERSION, data }));
}

function readAndMigrate(localStorageRef, key, normalizeFn, defaultValue) {
  const raw = localStorageRef.getItem(key);
  if (!raw) {
    return defaultValue;
  }

  const parsed = safeParse(raw);
  if (parsed === null) {
    persistVersioned(localStorageRef, key, defaultValue);
    return defaultValue;
  }

  const migratedData = isVersionedEnvelope(parsed)
    ? migrateVersionedValue(key, parsed.version, parsed.data)
    : migrateLegacyValue(key, parsed);

  const normalized = normalizeFn(migratedData);
  persistVersioned(localStorageRef, key, normalized);
  return normalized;
}

export function readResults(localStorageRef = localStorage) {
  try {
    return readAndMigrate(localStorageRef, RESULTS_KEY, normalizeResults, defaultResults());
  } catch {
    return defaultResults();
  }
}

export function writeResults(results, localStorageRef = localStorage) {
  const normalized = normalizeResults(results);
  try {
    persistVersioned(localStorageRef, RESULTS_KEY, normalized);
  } catch {
    // localStorage may be unavailable
  }
  return normalized;
}

export function readSessions(localStorageRef = localStorage) {
  try {
    return readAndMigrate(localStorageRef, SESSIONS_KEY, normalizeSessions, []);
  } catch {
    return [];
  }
}

export function writeSessions(sessions, localStorageRef = localStorage) {
  const normalized = normalizeSessions(sessions);
  try {
    persistVersioned(localStorageRef, SESSIONS_KEY, normalized);
  } catch {
    // localStorage may be unavailable
  }
  return normalized;
}

export function readCurriculumState(localStorageRef = localStorage) {
  try {
    return readAndMigrate(
      localStorageRef,
      CURRICULUM_STATE_KEY,
      normalizeCurriculumState,
      defaultCurriculumState()
    );
  } catch {
    return defaultCurriculumState();
  }
}

export function writeCurriculumState(curriculumState, localStorageRef = localStorage) {
  const normalized = normalizeCurriculumState(curriculumState);
  try {
    persistVersioned(localStorageRef, CURRICULUM_STATE_KEY, normalized);
  } catch {
    // localStorage may be unavailable
  }
  return normalized;
}

export function getStorageSchemaVersion() {
  return STORAGE_SCHEMA_VERSION;
}
