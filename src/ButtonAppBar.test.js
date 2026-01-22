import { render, screen } from '@testing-library/react';
import ButtonAppBar from './ButtonAppBar';

test('renders app bar controls', () => {
  render(<ButtonAppBar />);

  expect(screen.getByText('Mathimagic')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /menu/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
});
