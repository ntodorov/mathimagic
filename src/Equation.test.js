import React from 'react';
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

const EquationHarness = ({ onNext }) => {
  const [value, setValue] = React.useState('');

  return (
    <Equation
      eq={equation}
      value={value}
      onNext={onNext}
      onAnswerChange={(id, payload) => setValue(payload.value)}
    />
  );
};

test('does not show correctness feedback while typing', async () => {
  const user = userEvent.setup();

  render(<EquationHarness />);

  const input = screen.getByRole('textbox');
  await user.type(input, '5');

  expect(screen.queryByText(/try again/i)).not.toBeInTheDocument();
  expect(screen.queryByText(/awesome/i)).not.toBeInTheDocument();
  expect(
    screen.queryByTestId('feedback-icon-correct')
  ).not.toBeInTheDocument();
  expect(
    screen.queryByTestId('feedback-icon-incorrect')
  ).not.toBeInTheDocument();
});

test('pressing Enter calls onNext', async () => {
  const user = userEvent.setup();
  const onNext = jest.fn();

  render(<EquationHarness onNext={onNext} />);

  const input = screen.getByRole('textbox');
  await user.type(input, '1{enter}');

  expect(onNext).toHaveBeenCalled();
});
