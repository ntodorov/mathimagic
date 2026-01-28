import { render, screen } from '@testing-library/react';
import ButtonAppBar from './ButtonAppBar';

test('renders app bar controls', () => {
  render(<ButtonAppBar playerName="Test Kid" />);

  expect(screen.getByText('Mathimagic')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /menu/i })).toBeInTheDocument();
  expect(
    screen.getByRole('button', { name: /grown-ups/i })
  ).toBeInTheDocument();
  expect(screen.getByText(/hi, test kid/i)).toBeInTheDocument();
});
