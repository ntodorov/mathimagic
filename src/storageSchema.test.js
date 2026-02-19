import {
  defaultResults,
  getStorageSchemaVersion,
  readResults,
  readSessions,
  storageKeys,
  writeResults,
  writeSessions,
} from './storageSchema';

function createStorageMock() {
  let store = {};
  return {
    getItem: jest.fn((key) => (Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null)),
    setItem: jest.fn((key, value) => {
      store[key] = String(value);
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
}

describe('storage schema versioning', () => {
  let storage;

  beforeEach(() => {
    storage = createStorageMock();
  });

  test('writes versioned envelope for results and sessions', () => {
    writeResults({ totalCorrect: 3, totalAttempted: 5, sessionsCompleted: 1 }, storage);
    writeSessions([{ id: 's1', correct: 3, attempted: 5 }], storage);

    const resultsPayload = JSON.parse(storage.getItem(storageKeys.RESULTS_KEY));
    const sessionsPayload = JSON.parse(storage.getItem(storageKeys.SESSIONS_KEY));

    expect(resultsPayload.version).toBe(getStorageSchemaVersion());
    expect(resultsPayload.data).toEqual({ totalCorrect: 3, totalAttempted: 5, sessionsCompleted: 1 });

    expect(sessionsPayload.version).toBe(getStorageSchemaVersion());
    expect(sessionsPayload.data).toEqual([
      {
        id: 's1',
        operationType: 'unknown',
        correct: 3,
        attempted: 5,
        total: 5,
        completed: false,
        startedAt: null,
        endedAt: null,
        durationMs: 0,
        questions: [],
      },
    ]);
  });

  test('migrates legacy unversioned payloads and backfills missing fields', () => {
    storage.setItem(storageKeys.RESULTS_KEY, JSON.stringify({ totalCorrect: 7, totalAttempted: 10 }));
    storage.setItem(storageKeys.SESSIONS_KEY, JSON.stringify([{ correct: 2, attempted: 3 }]));

    const results = readResults(storage);
    const sessions = readSessions(storage);

    expect(results).toEqual({ totalCorrect: 7, totalAttempted: 10, sessionsCompleted: 0 });
    expect(sessions).toEqual([
      {
        id: 'legacy-0',
        operationType: 'unknown',
        correct: 2,
        attempted: 3,
        total: 3,
        completed: false,
        startedAt: null,
        endedAt: null,
        durationMs: 0,
        questions: [],
      },
    ]);

    const persistedResults = JSON.parse(storage.getItem(storageKeys.RESULTS_KEY));
    const persistedSessions = JSON.parse(storage.getItem(storageKeys.SESSIONS_KEY));

    expect(persistedResults).toEqual({
      version: getStorageSchemaVersion(),
      data: { totalCorrect: 7, totalAttempted: 10, sessionsCompleted: 0 },
    });
    expect(persistedSessions.version).toBe(getStorageSchemaVersion());
  });

  test('returns safe defaults for corrupted payloads', () => {
    storage.setItem(storageKeys.RESULTS_KEY, '{not-json');
    storage.setItem(storageKeys.SESSIONS_KEY, 'boom');

    const results = readResults(storage);
    const sessions = readSessions(storage);

    expect(results).toEqual(defaultResults());
    expect(sessions).toEqual([]);

    expect(JSON.parse(storage.getItem(storageKeys.RESULTS_KEY))).toEqual({
      version: getStorageSchemaVersion(),
      data: defaultResults(),
    });
    expect(JSON.parse(storage.getItem(storageKeys.SESSIONS_KEY))).toEqual({
      version: getStorageSchemaVersion(),
      data: [],
    });
  });

  test('sanitizes invalid versioned data payloads', () => {
    storage.setItem(
      storageKeys.RESULTS_KEY,
      JSON.stringify({ version: getStorageSchemaVersion(), data: { totalCorrect: -3, totalAttempted: 'x' } })
    );
    storage.setItem(
      storageKeys.SESSIONS_KEY,
      JSON.stringify({
        version: getStorageSchemaVersion(),
        data: [{ id: 's2', durationMs: -1, questions: [null, { prompt: '2+2', perQuestionDurationMs: -8 }] }],
      })
    );

    expect(readResults(storage)).toEqual({ totalCorrect: 0, totalAttempted: 0, sessionsCompleted: 0 });
    expect(readSessions(storage)).toEqual([
      {
        id: 's2',
        operationType: 'unknown',
        correct: 0,
        attempted: 0,
        total: 0,
        completed: false,
        startedAt: null,
        endedAt: null,
        durationMs: 0,
        questions: [{ prompt: '2+2', perQuestionDurationMs: 0, firstShownAt: null }],
      },
    ]);
  });
});
