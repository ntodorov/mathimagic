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

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

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

test('start practice shows equations and moves focus to first question', async () => {
  const user = userEvent.setup();
  render(<App />);

  // Click start practice
  await user.click(screen.getByRole('button', { name: /start practice/i }));

  // Now equations should be visible
  await waitFor(() => {
    expect(screen.getAllByRole('textbox')).toHaveLength(10);
  });

  const firstInput = screen.getByRole('textbox', {
    name: /answer for question 1$/i,
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

  await user.click(screen.getByRole('button', { name: /end session/i }));

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
      name: /answer for question 1$/i,
    });
    await user.type(firstInput, '1');

    await user.click(screen.getByRole('button', { name: /end session/i }));

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
