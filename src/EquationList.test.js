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

  test('renders 10 subtraction equations by default', () => {
    render(<EquationList />);

    expect(screen.getByText(/Subtraction Challenge/i)).toBeInTheDocument();
    expect(screen.getAllByRole('textbox')).toHaveLength(10);
    expect(screen.getAllByText(/2\s-\s1\s=/)).toHaveLength(10);
  });

  test('renders addition equations when operationType is addition', () => {
    render(<EquationList operationType="addition" />);

    expect(screen.getByText(/Addition Challenge/i)).toBeInTheDocument();
    expect(screen.getAllByText(/1\s\+\s1\s=/)).toHaveLength(10);
  });

  test('renders multiplication equations when operationType is multiplication', () => {
    render(<EquationList operationType="multiplication" />);

    expect(screen.getByText(/Multiply Challenge/i)).toBeInTheDocument();
    expect(screen.getAllByText(/1\s×\s1\s=/)).toHaveLength(10);
  });

  test('calls onEndSession with current stats', async () => {
    const user = userEvent.setup();
    const onEndSession = jest.fn();

    render(<EquationList onEndSession={onEndSession} />);

    await user.click(screen.getByRole('button', { name: /end session/i }));

    expect(onEndSession).toHaveBeenCalledWith({
      correct: 0,
      attempted: 0,
      total: 10,
      completed: false,
    });
  });

  test('updates session stats as answers are correct', async () => {
    const user = userEvent.setup();

    render(<EquationList />);

    expect(screen.getByText(/Stars Earned/i)).toBeInTheDocument();
    expect(screen.getByText(/Progress/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Try New Problems/i })
    ).toBeInTheDocument();

    const inputs = screen.getAllByRole('textbox');
    await user.type(inputs[0], '1');

    expect(screen.getByText('1/10')).toBeInTheDocument();
  });
});
