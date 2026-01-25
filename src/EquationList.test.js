import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EquationList from './EquationList';

describe('EquationList', () => {
  let randomSpy;

  beforeEach(() => {
    randomSpy = jest.spyOn(Math, 'random').mockReturnValue(0);
  });

  afterEach(() => {
    randomSpy.mockRestore();
  });

  test('renders 10 subtraction equations', () => {
    render(<EquationList />);

    expect(screen.getByText('Subtraction')).toBeInTheDocument();
    expect(screen.getAllByRole('textbox')).toHaveLength(10);
    expect(screen.getAllByText(/2\s-\s1\s=/)).toHaveLength(10);
  });

  test('updates session footer as answers are correct', async () => {
    const user = userEvent.setup();

    render(<EquationList />);

    expect(screen.getByText(/streak/i)).toBeInTheDocument();
    expect(screen.getByText(/daily goal/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /start a new set/i })
    ).toBeInTheDocument();

    const inputs = screen.getAllByRole('textbox');
    await user.type(inputs[0], '1');

    expect(screen.getByText('1/10')).toBeInTheDocument();
  });
});
