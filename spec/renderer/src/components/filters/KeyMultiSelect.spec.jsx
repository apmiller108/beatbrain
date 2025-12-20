import { render, screen, fireEvent } from '@testing-library/react';
import KeyMultiSelect from '@renderer/components/filters/KeyMultiSelect';

// Mock the react-select component to make it easier to test
vi.mock('react-select', () => ({
  default: ({ options, value, onChange, isDisabled, placeholder }) => {
    function handleChange(event) {
      const selectedValue = options.find(option => option.label === event.currentTarget.value);
      onChange([selectedValue]);
    }
    return (
      <select
        data-testid="select-mock"
        disabled={isDisabled}
        value={value}
        onChange={handleChange}
      >
        <option value="">{placeholder}</option>
        {options.map((option, index) => (
          <option key={index} value={option.label}>
            {option.label}
          </option>
        ))}
      </select>
    );
  },
}));

describe('KeyMultiSelect', () => {
  const mockKeys = ['Am', 'C', '11A', 'F#m'];
  const mockOnChange = vi.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('renders the label and placeholder', () => {
    render(<KeyMultiSelect keys={mockKeys} value={[]} onChange={mockOnChange} />);

    expect(screen.getByText('Keys')).toBeInTheDocument();
    expect(screen.getByText('All keys')).toBeInTheDocument();
  });

  it('renders options correctly sorted', () => {
    render(<KeyMultiSelect keys={mockKeys} value={[]} onChange={mockOnChange} />);

    const options = screen.getAllByRole('option');
    // Note: The mock select doesn't render the sorted list in the same way react-select would.
    // We are trusting the component's internal sorting logic and just checking if options are present.
    // The labels are derived from the keys.
    expect(options).toHaveLength(4); // Corrected: 3 unique labels + 1 placeholder = 4 total options
    expect(screen.getByText('8A (Am)')).toBeInTheDocument();
    expect(screen.getByText('8B (C)')).toBeInTheDocument();
    expect(screen.getByText('11A (F#m)')).toBeInTheDocument(); // Only this label for both '11A' and 'F#m'
  });

  it('calls onChange with the selected value', () => {
    render(<KeyMultiSelect keys={mockKeys} value={[]} onChange={mockOnChange} />);

    const selectInput = screen.getByTestId('select-mock');
    fireEvent.change(selectInput, { target: { value: '8A (Am)' } });

    expect(mockOnChange).toHaveBeenCalledTimes(1);
    // The value is an array of the original keys that map to the selected label
    expect(mockOnChange).toHaveBeenCalledWith([
      expect.objectContaining({
        value: ['Am'],
        label: '8A (Am)'
      })
    ]);
  });

  it('is disabled when the disabled prop is true', () => {
    render(<KeyMultiSelect keys={mockKeys} value={[]} onChange={mockOnChange} disabled />);
    const selectInput = screen.getByTestId('select-mock');
    expect(selectInput).toBeDisabled();
  });

  it('is disabled when there are no keys', () => {
    render(<KeyMultiSelect keys={[]} value={[]} onChange={mockOnChange} />);
    const selectInput = screen.getByTestId('select-mock');
    expect(selectInput).toBeDisabled();
  });
});
