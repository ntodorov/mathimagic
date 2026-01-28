import { useState, useCallback } from 'react';

const STORAGE_KEY = 'mathimagic_username';
const RESULTS_KEY = 'mathimagic_results';

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

// Results storage
export function useResults() {
  const [results, setResultsState] = useState(() => {
    try {
      const saved = localStorage.getItem(RESULTS_KEY);
      return saved ? JSON.parse(saved) : { totalCorrect: 0, totalAttempted: 0, sessionsCompleted: 0 };
    } catch {
      return { totalCorrect: 0, totalAttempted: 0, sessionsCompleted: 0 };
    }
  });

  const updateResults = useCallback((sessionResults) => {
    setResultsState((prev) => {
      const updated = {
        totalCorrect: prev.totalCorrect + sessionResults.correct,
        totalAttempted: prev.totalAttempted + sessionResults.attempted,
        sessionsCompleted: prev.sessionsCompleted + 1,
      };
      try {
        localStorage.setItem(RESULTS_KEY, JSON.stringify(updated));
      } catch {
        // localStorage might not be available
      }
      return updated;
    });
  }, []);

  const resetResults = useCallback(() => {
    const initial = { totalCorrect: 0, totalAttempted: 0, sessionsCompleted: 0 };
    try {
      localStorage.setItem(RESULTS_KEY, JSON.stringify(initial));
    } catch {
      // localStorage might not be available
    }
    setResultsState(initial);
  }, []);

  return { results, updateResults, resetResults };
}

export { generateRandomUsername };
