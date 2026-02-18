import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  configurable: true,
  writable: true,
});

beforeEach(() => {
  localStorageMock.clear();
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
      expect(screen.getByText(/15\s-\s1\s=/)).toBeInTheDocument();
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
      expect(screen.getByText(/Subtraction Session/i)).toBeInTheDocument();
    });

    expect(screen.getByText('1/1')).toBeInTheDocument();
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
    expect(screen.queryByText(/Subtraction Session/i)).not.toBeInTheDocument();
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

    expect(await screen.findByText(/Subtraction Session/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /delete/i }));

    await waitFor(() => {
      expect(screen.queryByText(/Subtraction Session/i)).not.toBeInTheDocument();
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
