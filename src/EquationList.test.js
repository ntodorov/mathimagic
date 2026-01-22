import { render, screen } from '@testing-library/react';
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
});
