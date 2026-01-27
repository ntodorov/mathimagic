import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

test('renders app chrome and equations', () => {
  render(<App />);

  expect(screen.getByText('Mathimagic')).toBeInTheDocument();
  expect(
    screen.getByText(/Math practice that feels like play/i)
  ).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  expect(
    screen.getByRole('button', { name: /start practice/i })
  ).toBeInTheDocument();
  expect(screen.getByText(/Today's goal/i)).toBeInTheDocument();
  expect(screen.getByText('Subtraction')).toBeInTheDocument();
  expect(screen.getAllByRole('textbox')).toHaveLength(10);
});

test('start practice moves focus to first question', async () => {
  const user = userEvent.setup();
  render(<App />);

  await user.click(screen.getByRole('button', { name: /start practice/i }));

  const firstInput = screen.getByRole('textbox', {
    name: /answer for question 1/i,
  });

  await waitFor(() => {
    expect(firstInput).toHaveFocus();
  });
});
