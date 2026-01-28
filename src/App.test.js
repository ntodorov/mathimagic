import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

beforeEach(() => {
  window.localStorage.clear();
});

test('renders app chrome and waits to start session', () => {
  window.localStorage.setItem('mathimagic-player-name', 'Test Kid');
  render(<App />);

  expect(screen.getByText('Mathimagic')).toBeInTheDocument();
  expect(
    screen.getByText(/playful math missions/i)
  ).toBeInTheDocument();
  expect(
    screen.getByRole('button', { name: /grown-ups/i })
  ).toBeInTheDocument();
  expect(
    screen.getByRole('button', { name: /start session/i })
  ).toBeInTheDocument();
  expect(screen.getByLabelText(/your fun name/i)).toHaveValue('Test Kid');
  expect(screen.getByText(/no questions yet/i)).toBeInTheDocument();
  expect(
    screen.queryByRole('textbox', { name: /answer for question 1/i })
  ).not.toBeInTheDocument();
});

test('start session moves focus to first question', async () => {
  window.localStorage.setItem('mathimagic-player-name', 'Test Kid');
  const user = userEvent.setup();
  render(<App />);

  await user.click(screen.getByRole('button', { name: /start session/i }));

  const firstInput = await screen.findByRole('textbox', {
    name: /answer for question 1$/i,
  });

  await waitFor(() => {
    expect(firstInput).toHaveFocus();
  });
});

test('creates a stored name when none exists', () => {
  render(<App />);

  const storedName = window.localStorage.getItem('mathimagic-player-name');
  expect(storedName).toBeTruthy();
  expect(screen.getByLabelText(/your fun name/i)).toHaveValue(storedName);
});
