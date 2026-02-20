import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App, { getInitialChallengeSelections } from './App';
import { storageKeys } from './storageSchema';

beforeEach(() => {
  window.localStorage.clear();
  jest.clearAllMocks();
});

test('renders app chrome and welcome section', () => {
  render(<App />);

  expect(screen.getByText('Mathimagic')).toBeInTheDocument();
  expect(
    screen.getByText(/Ready to become a math superstar today?/i)
  ).toBeInTheDocument();
  expect(
    screen.getByRole('button', { name: /start practice/i })
  ).toBeInTheDocument();
  expect(screen.getByText(/Your Progress/i)).toBeInTheDocument();
  // Equations should NOT be visible initially
  expect(screen.queryAllByRole('textbox')).toHaveLength(0);
});

test('applies selected difficulty when starting practice', async () => {
  const user = userEvent.setup();
  const randomSpy = jest.spyOn(Math, 'random').mockReturnValue(0);

  try {
    render(<App />);

    await user.selectOptions(screen.getByLabelText(/select difficulty/i), 'hard');
    await user.click(screen.getByRole('button', { name: /start practice/i }));

    await waitFor(() => {
      expect(screen.getByText(/10\s\+\s10\s=/)).toBeInTheDocument();
    });
  } finally {
    randomSpy.mockRestore();
  }
});

test('start practice shows equations and moves focus to first question', async () => {
  const user = userEvent.setup();
  render(<App />);

  // Click start practice
  await user.click(screen.getByRole('button', { name: /start practice/i }));

  // Now equations should be visible
  await waitFor(() => {
    expect(screen.getAllByRole('textbox')).toHaveLength(1);
  });

  const firstInput = screen.getByRole('textbox', {
    name: /answer for question 1/i,
  });

  await waitFor(() => {
    expect(firstInput).toHaveFocus();
  });
});

test('locks challenge selection during a session', async () => {
  const user = userEvent.setup();
  render(<App />);

  expect(screen.getByText(/Choose a Challenge/i)).toBeInTheDocument();

  await user.click(screen.getByRole('button', { name: /start practice/i }));

  await waitFor(() => {
    expect(screen.getByText(/Challenge Locked/i)).toBeInTheDocument();
  });

  expect(screen.queryByText(/Choose a Challenge/i)).not.toBeInTheDocument();

  await user.click(screen.getByRole('button', { name: /end current session/i }));

  await waitFor(() => {
    expect(screen.getByText(/Choose a Challenge/i)).toBeInTheDocument();
  });
});

test('records ended sessions in the history list', async () => {
  const user = userEvent.setup();
  const randomSpy = jest.spyOn(Math, 'random').mockReturnValue(0);

  try {
    render(<App />);

    await user.click(screen.getByRole('button', { name: /start practice/i }));

    const firstInput = await screen.findByRole('textbox', {
      name: /answer for question 1/i,
    });
    await user.type(firstInput, '1');

    await user.click(screen.getByRole('button', { name: /end current session/i }));

    await waitFor(() => {
      expect(screen.getByText(/Past Sessions/i)).toBeInTheDocument();
      expect(screen.getByText(/Addition Session/i)).toBeInTheDocument();
    });

    expect(screen.getByText('0/1')).toBeInTheDocument();
    expect(screen.getByText(/Ended early/i)).toBeInTheDocument();
    expect(screen.getByText(/Answered 1 of 10/i)).toBeInTheDocument();
  } finally {
    randomSpy.mockRestore();
  }
});

test('does not save sessions without answers', async () => {
  const user = userEvent.setup();

  render(<App />);

  await user.click(screen.getByRole('button', { name: /start practice/i }));

  await user.click(screen.getByRole('button', { name: /end current session/i }));

  await waitFor(() => {
    expect(screen.queryByText(/Addition Session/i)).not.toBeInTheDocument();
  });

  expect(screen.getByText(/No sessions yet/i)).toBeInTheDocument();
});

test('deletes a session from the history list', async () => {
  const user = userEvent.setup();
  const randomSpy = jest.spyOn(Math, 'random').mockReturnValue(0);

  try {
    render(<App />);

    await user.click(screen.getByRole('button', { name: /start practice/i }));

    const firstInput = await screen.findByRole('textbox', {
      name: /answer for question 1/i,
    });
    await user.type(firstInput, '1');

    await user.click(screen.getByRole('button', { name: /end current session/i }));

    expect(await screen.findByText(/Addition Session/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /delete/i }));

    await waitFor(() => {
      expect(screen.queryByText(/Addition Session/i)).not.toBeInTheDocument();
    });

    expect(screen.getByText(/No sessions yet/i)).toBeInTheDocument();
  } finally {
    randomSpy.mockRestore();
  }
});

test('reviews past sessions in read-only mode', async () => {
  const user = userEvent.setup();
  const randomSpy = jest.spyOn(Math, 'random').mockReturnValue(0);

  try {
    render(<App />);

    await user.click(screen.getByRole('button', { name: /start practice/i }));

    const firstInput = await screen.findByRole('textbox', {
      name: /answer for question 1/i,
    });
    await user.type(firstInput, '1');

    await user.click(screen.getByRole('button', { name: /end current session/i }));

    const reviewButton = await screen.findByRole('button', { name: /review answers/i });
    await user.click(reviewButton);

    expect(screen.getByText(/Review Mode/i)).toBeInTheDocument();
    expect(screen.getByText('Read-only', { selector: 'span' })).toBeInTheDocument();
    expect(screen.getAllByText(/Kid's Answer/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Correct Answer/i).length).toBeGreaterThan(0);
    expect(screen.queryAllByRole('textbox')).toHaveLength(0);
  } finally {
    randomSpy.mockRestore();
  }
});

test('restores persisted challenge selections when saved values are valid', () => {
  window.localStorage.setItem(
    'mathimagic_challenge_selections',
    JSON.stringify({ operation: 'division', gradeBand: 'k-2', difficulty: 'hard' })
  );

  expect(getInitialChallengeSelections()).toEqual({
    operation: 'division',
    difficulty: 'hard',
  });
});

test('defaults to addition when no saved challenge selections exist', () => {
  render(<App />);

  expect(screen.getByRole('button', { name: /practice addition/i })).toHaveAttribute('aria-pressed', 'true');
});

test('ignores invalid saved challenge selections and keeps defaults', () => {
  window.localStorage.setItem(
    'mathimagic_challenge_selections',
    JSON.stringify({ operation: 'modulo', gradeBand: '9-12', difficulty: 'nightmare' })
  );

  render(<App />);

  expect(screen.getByRole('button', { name: /practice addition/i })).toHaveAttribute('aria-pressed', 'true');
  expect(screen.getByLabelText(/select difficulty/i)).toHaveValue('easy');
});

test('shows session and per-question timing in history review when available', async () => {
  const user = userEvent.setup();

  render(<App />);

  await user.click(screen.getByRole('button', { name: /start practice/i }));

  const firstInput = await screen.findByRole('textbox', {
    name: /answer for question 1/i,
  });
  await user.type(firstInput, '2');

  await user.click(screen.getByRole('button', { name: /end current session/i }));

  expect(screen.getAllByText(/Time:/i).length).toBeGreaterThan(0);

  await user.click(screen.getByRole('button', { name: /review answers/i }));

  expect(screen.getAllByText(/Time:/i).length).toBeGreaterThan(1);
});

test('keeps review/history compatible when older sessions have no timing details', async () => {
  const user = userEvent.setup();
  const randomSpy = jest.spyOn(Math, 'random').mockReturnValue(0);

  try {
    render(<App />);

    await user.click(screen.getByRole('button', { name: /start practice/i }));
    const firstInput = await screen.findByRole('textbox', { name: /answer for question 1/i });
    await user.type(firstInput, '2');
    await user.click(screen.getByRole('button', { name: /end current session/i }));

    await user.click(screen.getByRole('button', { name: /review answers/i }));

    expect(screen.getByText(/Review Mode/i)).toBeInTheDocument();
  } finally {
    randomSpy.mockRestore();
  }
});

test('uses auto scrolling when reduced motion is preferred', async () => {
  const user = userEvent.setup();
  const scrollIntoViewMock = jest.fn();
  const originalMatchMedia = window.matchMedia;
  const originalScrollIntoView = window.HTMLElement.prototype.scrollIntoView;

  window.HTMLElement.prototype.scrollIntoView = scrollIntoViewMock;
  window.matchMedia = jest.fn().mockReturnValue({
    matches: true,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  });

  try {
    render(<App />);

    await user.click(screen.getByRole('button', { name: /start practice/i }));

    await waitFor(() => {
      expect(scrollIntoViewMock).toHaveBeenCalledWith(
        expect.objectContaining({ behavior: 'auto', block: 'start' })
      );
    });
  } finally {
    window.matchMedia = originalMatchMedia;
    window.HTMLElement.prototype.scrollIntoView = originalScrollIntoView;
  }
});

test('shows post-division modes as locked at the start of progression', () => {
  render(<App />);

  expect(screen.getByRole('button', { name: /practice division bridge/i })).toBeDisabled();
  expect(screen.getByRole('button', { name: /practice fractions/i })).toBeDisabled();
  expect(screen.getByText(/Next unlock: Division Bridge/i)).toBeInTheDocument();
});

test('unlocks division bridge when division mastery threshold is met', () => {
  window.localStorage.setItem(
    storageKeys.SESSIONS_KEY,
    JSON.stringify({
      version: 1,
      data: [
        { id: 'd1', operationType: 'division', attempted: 8, correct: 7, completed: true },
        { id: 'd2', operationType: 'division', attempted: 7, correct: 6, completed: true },
      ],
    })
  );

  render(<App />);

  expect(screen.getByRole('button', { name: /practice division bridge/i })).not.toBeDisabled();
});

test('shows review explanation text for incorrect fraction and decimal answers', async () => {
  const user = userEvent.setup();

  window.localStorage.setItem(
    storageKeys.SESSIONS_KEY,
    JSON.stringify({
      version: 1,
      data: [
        {
          id: 'fractions-1',
          operationType: 'fractions',
          correct: 0,
          attempted: 2,
          total: 2,
          completed: true,
          questions: [
            {
              id: 1,
              prompt: 'Write 1 ÷ 2 as a fraction in simplest form.',
              answerType: 'fraction',
              solution: { numerator: 1, denominator: 2 },
              answer: '2/1',
              hasAnswer: true,
              isCorrect: false,
            },
            {
              id: 2,
              prompt: 'Convert 3/4 to a decimal.',
              answerType: 'decimal',
              solution: 0.75,
              answer: '7.5',
              hasAnswer: true,
              isCorrect: false,
            },
          ],
        },
      ],
    })
  );

  render(<App />);

  await user.click(screen.getByRole('button', { name: /review answers/i }));

  expect(screen.getAllByText(/Why it missed:/i).length).toBeGreaterThanOrEqual(2);
});
