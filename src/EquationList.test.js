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

  test('renders a single addition card by default', () => {
    render(<EquationList />);

    expect(screen.getByText(/Addition Challenge/i)).toBeInTheDocument();
    expect(screen.getAllByRole('textbox')).toHaveLength(1);
    expect(screen.getAllByText(/1\s\+\s1\s=/)).toHaveLength(1);
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

  test('renders division equations when operationType is division', () => {
    render(<EquationList operationType="division" />);

    expect(screen.getByText(/Division Challenge/i)).toBeInTheDocument();
    expect(screen.getAllByText(/1\s÷\s1\s=/)).toHaveLength(1);
  });

  test('uses grade and difficulty profile settings when generating equations', () => {
    render(
      <EquationList
        operationType="multiplication"
        gradeBand="k-2"
        difficulty="hard"
      />
    );

    expect(screen.getAllByText(/5\s×\s5\s=/)).toHaveLength(1);
  });

  test('injects adaptive weak facts at the start of a core session', () => {
    render(
      <EquationList
        operationType="addition"
        adaptiveFacts={[
          { x: 7, y: 8, misses: 2, lastMissedAt: '2026-02-02T10:00:00.000Z' },
        ]}
      />
    );

    expect(screen.getByText(/7\s\+\s8\s=/)).toBeInTheDocument();
    expect(screen.getByText(/Adaptive focus: revisiting 1 tricky fact/i)).toBeInTheDocument();
  });

  test('calls onEndSession with current stats', async () => {
    const user = userEvent.setup();
    const onEndSession = jest.fn();

    render(<EquationList onEndSession={onEndSession} />);

    await user.click(screen.getByRole('button', { name: /end current session/i }));

    expect(onEndSession).toHaveBeenCalledWith(expect.objectContaining({
      correct: 0,
      attempted: 0,
      total: 10,
      completed: false,
      startedAt: expect.any(String),
      endedAt: expect.any(String),
      durationMs: expect.any(Number),
      questions: expect.any(Array),
    }));

    const [sessionPayload] = onEndSession.mock.calls[0];
    expect(sessionPayload.questions).toHaveLength(10);
    expect(sessionPayload.questions[0]).toEqual(expect.objectContaining({
      id: 1,
      x: 1,
      y: 1,
      operation: '+',
      solution: 2,
      answer: '',
      hasAnswer: false,
      isCorrect: false,
      firstShownAt: expect.any(String),
      perQuestionDurationMs: expect.any(Number),
    }));
  });

  test('updates session stats as answers are entered', async () => {
    const user = userEvent.setup();

    render(<EquationList />);

    expect(screen.getByText(/Answered/i)).toBeInTheDocument();
    expect(screen.getByText(/Progress/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /start a new set of practice problems/i })
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

    const nextButton = screen.getByRole('button', { name: /go to next question/i });
    await user.click(nextButton);

    expect(
      screen.getByRole('textbox', { name: /question 2/i })
    ).toBeInTheDocument();
  });

  test('supports arrow-key navigation for previous and next', async () => {
    const user = userEvent.setup();

    render(<EquationList />);

    const firstInput = screen.getByRole('textbox', { name: /question 1/i });
    await user.type(firstInput, '1');
    await user.keyboard('{ArrowRight}');

    expect(screen.getByRole('textbox', { name: /question 2/i })).toBeInTheDocument();

    await user.keyboard('{ArrowLeft}');

    expect(screen.getByRole('textbox', { name: /question 1/i })).toBeInTheDocument();
  });

  test('captures per-question timing and session duration', async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-01-01T00:00:00.000Z'));

    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    const onEndSession = jest.fn();

    render(<EquationList onEndSession={onEndSession} />);

    const input = screen.getByRole('textbox', { name: /question 1/i });
    await user.type(input, '1');

    jest.advanceTimersByTime(1200);
    await user.click(screen.getByRole('button', { name: /go to next question/i }));
    jest.advanceTimersByTime(800);

    await user.click(screen.getByRole('button', { name: /end current session/i }));

    const [payload] = onEndSession.mock.calls[0];
    expect(payload.durationMs).toBeGreaterThanOrEqual(2000);
    expect(payload.questions[0].perQuestionDurationMs).toBeGreaterThanOrEqual(1200);

    jest.useRealTimers();
  });
});
