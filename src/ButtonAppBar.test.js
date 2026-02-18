import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ButtonAppBar from './ButtonAppBar';

test('renders app bar with username', () => {
  const mockRegenerate = jest.fn();
  render(
    <ButtonAppBar username="HappyPanda123" onRegenerateUsername={mockRegenerate} />
  );

  expect(screen.getByText('Mathimagic')).toBeInTheDocument();
  expect(screen.getByText('HappyPanda123')).toBeInTheDocument();
});

test('clicking username button calls regenerate function', async () => {
  const user = userEvent.setup();
  const mockRegenerate = jest.fn();
  render(
    <ButtonAppBar username="HappyPanda123" onRegenerateUsername={mockRegenerate} />
  );

  await user.click(
    screen.getByRole('button', { name: /change player name\. current name happypanda123/i })
  );
  expect(mockRegenerate).toHaveBeenCalledTimes(1);
});
