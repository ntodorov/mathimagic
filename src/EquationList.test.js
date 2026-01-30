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

  test('renders a single subtraction card by default', () => {
    render(<EquationList />);

    expect(screen.getByText(/Subtraction Challenge/i)).toBeInTheDocument();
    expect(screen.getAllByRole('textbox')).toHaveLength(1);
    expect(screen.getAllByText(/2\s-\s1\s=/)).toHaveLength(1);
  });

  test('renders addition equations when operationType is addition', () => {
    render(<EquationList operationType="addition" />);

    expect(screen.getByText(/Addition Challenge/i)).toBeInTheDocument();
    expect(screen.getAllByText(/1\s\+\s1\s=/)).toHaveLength(1);
  });

  test('renders multiplication equations when operationType is multiplication', () => {
    render(<EquationList operationType="multiplication" />);

    expect(screen.getByText(/Multiply Challenge/i)).toBeInTheDocument();
    expect(screen.getAllByText(/1\s×\s1\s=/)).toHaveLength(1);
  });

  test('calls onEndSession with current stats', async () => {
    const user = userEvent.setup();
    const onEndSession = jest.fn();

    render(<EquationList onEndSession={onEndSession} />);

    await user.click(screen.getByRole('button', { name: /end session/i }));

    expect(onEndSession).toHaveBeenCalledWith(expect.objectContaining({
      correct: 0,
      attempted: 0,
      total: 10,
      completed: false,
      questions: expect.any(Array),
    }));

    const [sessionPayload] = onEndSession.mock.calls[0];
    expect(sessionPayload.questions).toHaveLength(10);
    expect(sessionPayload.questions[0]).toEqual(expect.objectContaining({
      id: 1,
      x: 2,
      y: 1,
      operation: '-',
      solution: 1,
      answer: '',
      hasAnswer: false,
      isCorrect: false,
    }));
  });

  test('updates session stats as answers are entered', async () => {
    const user = userEvent.setup();

    render(<EquationList />);

    expect(screen.getByText(/Answered/i)).toBeInTheDocument();
    expect(screen.getByText(/Progress/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Try New Problems/i })
    ).toBeInTheDocument();

    const input = screen.getByRole('textbox');
    await user.type(input, '1');

    expect(screen.getByText('1/10')).toBeInTheDocument();
  });

  test('advances to the next question with Next', async () => {
    const user = userEvent.setup();

    render(<EquationList />);

    const input = screen.getByRole('textbox', { name: /question 1/i });
    await user.type(input, '1');

    const nextButton = screen.getByRole('button', { name: /next/i });
    await user.click(nextButton);

    expect(
      screen.getByRole('textbox', { name: /question 2/i })
    ).toBeInTheDocument();
  });
});
