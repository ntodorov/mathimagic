import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Equation from './Equation';

const equation = {
  id: 1,
  x: 2,
  y: 1,
  operation: '-',
  solution: 1,
};

test('renders equation text', () => {
  render(<Equation eq={equation} />);

  expect(screen.getByText(/2\s-\s1\s=/)).toBeInTheDocument();
});

test('shows feedback icon based on answer', async () => {
  const user = userEvent.setup();

  render(<Equation eq={equation} />);

  const input = screen.getByRole('textbox');
  expect(
    screen.queryByTestId('SentimentSatisfiedAltIcon')
  ).not.toBeInTheDocument();
  expect(
    screen.queryByTestId('SentimentDissatisfiedIcon')
  ).not.toBeInTheDocument();

  await user.type(input, '5');
  expect(
    screen.getByTestId('SentimentDissatisfiedIcon')
  ).toBeInTheDocument();

  await user.clear(input);
  await user.type(input, '1');
  expect(
    screen.getByTestId('SentimentSatisfiedAltIcon')
  ).toBeInTheDocument();
  expect(
    screen.queryByTestId('SentimentDissatisfiedIcon')
  ).not.toBeInTheDocument();
});
