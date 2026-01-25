import { render, screen } from '@testing-library/react';
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
