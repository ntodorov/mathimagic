import { render, screen, waitFor } from '@testing-library/react';
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

  test('switches to addition equations when selected', async () => {
    const user = userEvent.setup();

    render(<EquationList />);

    await user.click(screen.getByRole('button', { name: /addition/i }));

    await waitFor(() => {
      expect(screen.getByText(/Addition Challenge/i)).toBeInTheDocument();
    });
    expect(screen.getAllByText(/1\s\+\s1\s=/)).toHaveLength(10);
  });

  test('switches to multiplication equations when selected', async () => {
    const user = userEvent.setup();

    render(<EquationList />);

    await user.click(screen.getByRole('button', { name: /multiply/i }));

    await waitFor(() => {
      expect(screen.getByText(/Multiply Challenge/i)).toBeInTheDocument();
    });
    expect(screen.getAllByText(/1\s×\s1\s=/)).toHaveLength(10);
  });

  test('renders all three operation buttons', () => {
    render(<EquationList />);

    expect(screen.getByRole('button', { name: /addition/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /subtraction/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /multiply/i })).toBeInTheDocument();
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
