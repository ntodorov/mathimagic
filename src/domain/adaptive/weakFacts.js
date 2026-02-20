const CORE_ADAPTIVE_OPERATION_IDS = ['addition', 'subtraction', 'multiplication', 'division'];

function toFiniteNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function isCoreOperation(modeId) {
  return CORE_ADAPTIVE_OPERATION_IDS.includes(modeId);
}

function normalizeFactPair(operationType, x, y) {
  if (operationType === 'addition' || operationType === 'multiplication') {
    return x <= y ? { x, y } : { x: y, y: x };
  }
  return { x, y };
}

function inferOperationType(question, sessionOperationType) {
  const sourceMode = typeof question?.sourceMode === 'string' ? question.sourceMode : null;
  if (sourceMode && isCoreOperation(sourceMode)) {
    return sourceMode;
  }

  return isCoreOperation(sessionOperationType) ? sessionOperationType : null;
}

function inferHasAnswer(question) {
  if (typeof question?.hasAnswer === 'boolean') {
    return question.hasAnswer;
  }

  const rawAnswer = question?.answer;
  return String(rawAnswer ?? '').trim() !== '';
}

function inferIncorrect(question) {
  if (typeof question?.isCorrect === 'boolean') {
    return !question.isCorrect;
  }

  return false;
}

function deriveWeakFactsByOperation(sessions, options = {}) {
  const maxPerOperation = Number.isFinite(options.maxPerOperation)
    ? Math.max(1, Math.floor(options.maxPerOperation))
    : 6;

  const totalsByOperation = {};

  (Array.isArray(sessions) ? sessions : []).forEach((session) => {
    const sessionOperationType = typeof session?.operationType === 'string' ? session.operationType : null;
    const lastMissedAt = session?.endedAt ?? session?.startedAt ?? null;

    (Array.isArray(session?.questions) ? session.questions : []).forEach((question) => {
      const operationType = inferOperationType(question, sessionOperationType);
      if (!operationType) {
        return;
      }

      const answerType = question?.answerType ?? 'number';
      if (answerType !== 'number') {
        return;
      }

      if (!inferHasAnswer(question) || !inferIncorrect(question)) {
        return;
      }

      const x = toFiniteNumber(question?.x);
      const y = toFiniteNumber(question?.y);
      if (x === null || y === null) {
        return;
      }

      const normalizedPair = normalizeFactPair(operationType, x, y);
      if (!totalsByOperation[operationType]) {
        totalsByOperation[operationType] = {};
      }

      const key = `${normalizedPair.x}:${normalizedPair.y}`;
      const existing = totalsByOperation[operationType][key] ?? {
        operationType,
        x: normalizedPair.x,
        y: normalizedPair.y,
        misses: 0,
        lastMissedAt: null,
      };

      existing.misses += 1;
      if (lastMissedAt && (!existing.lastMissedAt || lastMissedAt > existing.lastMissedAt)) {
        existing.lastMissedAt = lastMissedAt;
      }

      totalsByOperation[operationType][key] = existing;
    });
  });

  const result = {};

  CORE_ADAPTIVE_OPERATION_IDS.forEach((operationType) => {
    const entries = Object.values(totalsByOperation[operationType] ?? {});
    entries.sort((left, right) => {
      if (right.misses !== left.misses) {
        return right.misses - left.misses;
      }
      const leftTime = left.lastMissedAt ?? '';
      const rightTime = right.lastMissedAt ?? '';
      if (leftTime === rightTime) {
        return 0;
      }
      return rightTime > leftTime ? 1 : -1;
    });

    result[operationType] = entries.slice(0, maxPerOperation);
  });

  return result;
}

module.exports = {
  CORE_ADAPTIVE_OPERATION_IDS,
  deriveWeakFactsByOperation,
};
