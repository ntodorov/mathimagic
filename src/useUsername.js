import { useState, useCallback } from 'react';
import {
  defaultResults,
  readResults,
  readSessions,
  writeResults,
  writeSessions,
} from './storageSchema';

const STORAGE_KEY = 'mathimagic_username';

// Funny kid-friendly username parts
const adjectives = [
  'Happy', 'Silly', 'Bouncy', 'Giggly', 'Sparkly', 'Fuzzy', 'Wiggly', 'Zippy',
  'Jolly', 'Snappy', 'Bubbly', 'Twinkly', 'Zesty', 'Peppy', 'Goofy', 'Dizzy',
  'Fluffy', 'Cosmic', 'Turbo', 'Super', 'Mega', 'Ultra', 'Speedy', 'Mighty',
  'Sunny', 'Starry', 'Rainbow', 'Golden', 'Magic', 'Lucky', 'Groovy', 'Funky'
];

const animals = [
  'Panda', 'Unicorn', 'Dragon', 'Penguin', 'Koala', 'Bunny', 'Puppy', 'Kitten',
  'Tiger', 'Lion', 'Bear', 'Fox', 'Owl', 'Dolphin', 'Monkey', 'Elephant',
  'Giraffe', 'Hippo', 'Dino', 'Rocket', 'Star', 'Ninja', 'Robot', 'Wizard',
  'Mermaid', 'Phoenix', 'Butterfly', 'Ladybug', 'Hedgehog', 'Squirrel', 'Otter', 'Sloth'
];

const numbers = ['123', '99', '42', '7', '88', '11', '22', '33', '44', '55', '77'];

function generateRandomUsername() {
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const animal = animals[Math.floor(Math.random() * animals.length)];
  const number = numbers[Math.floor(Math.random() * numbers.length)];
  return `${adjective}${animal}${number}`;
}

export function useUsername() {
  const [username, setUsernameState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return saved;
      const newUsername = generateRandomUsername();
      localStorage.setItem(STORAGE_KEY, newUsername);
      return newUsername;
    } catch {
      return generateRandomUsername();
    }
  });

  const setUsername = useCallback((newUsername) => {
    try {
      localStorage.setItem(STORAGE_KEY, newUsername);
    } catch {
      // localStorage might not be available
    }
    setUsernameState(newUsername);
  }, []);

  const regenerateUsername = useCallback(() => {
    const newUsername = generateRandomUsername();
    setUsername(newUsername);
    return newUsername;
  }, [setUsername]);

  return { username, setUsername, regenerateUsername };
}

const calculateResults = (sessions) => sessions.reduce((totals, session) => {
  totals.totalCorrect += Number(session.correct) || 0;
  totals.totalAttempted += Number(session.attempted) || 0;
  totals.sessionsCompleted += 1;
  return totals;
}, { totalCorrect: 0, totalAttempted: 0, sessionsCompleted: 0 });

// Results storage
export function useResults() {
  const [results, setResultsState] = useState(() => readResults());
  const [sessions, setSessionsState] = useState(() => readSessions());

  const recordSession = useCallback((sessionResults) => {
    const attempted = Number(sessionResults.attempted) || 0;
    if (attempted < 1) {
      return;
    }
    const correct = Number(sessionResults.correct) || 0;
    const normalizedSession = {
      id: sessionResults.id ?? `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      operationType: sessionResults.operationType ?? 'unknown',
      correct,
      attempted,
      total: Number(sessionResults.total) || attempted || 0,
      completed: Boolean(sessionResults.completed),
      startedAt: sessionResults.startedAt ?? null,
      endedAt: sessionResults.endedAt ?? null,
      questions: Array.isArray(sessionResults.questions) ? sessionResults.questions : [],
    };

    setResultsState((prev) => {
      const updated = {
        totalCorrect: prev.totalCorrect + correct,
        totalAttempted: prev.totalAttempted + attempted,
        sessionsCompleted: prev.sessionsCompleted + 1,
      };
      writeResults(updated);
      return updated;
    });

    setSessionsState((prev) => {
      const updatedSessions = [normalizedSession, ...prev];
      writeSessions(updatedSessions);
      return updatedSessions;
    });
  }, []);

  const deleteSession = useCallback((sessionId) => {
    if (!sessionId) {
      return;
    }

    setSessionsState((prev) => {
      const updatedSessions = prev.filter((session) => session.id !== sessionId);
      if (updatedSessions.length === prev.length) {
        return prev;
      }
      const updatedResults = calculateResults(updatedSessions);
      setResultsState(updatedResults);
      writeResults(updatedResults);
      writeSessions(updatedSessions);
      return updatedSessions;
    });
  }, []);

  const resetResults = useCallback(() => {
    const initial = defaultResults();
    writeResults(initial);
    writeSessions([]);
    setResultsState(initial);
    setSessionsState([]);
  }, []);

  return { results, sessions, recordSession, deleteSession, resetResults };
}

export { generateRandomUsername };
