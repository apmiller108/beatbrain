// Custom styles for react-select to match Bootstrap theme
export const selectCustomStyles = {
  control: (base, state) => ({
    ...base,
    borderColor: state.isFocused ? '#86b7fe' : '#dee2e6',
    boxShadow: state.isFocused ? '0 0 0 0.25rem rgba(13, 110, 253, 0.25)' : 'none',
    '&:hover': {
      borderColor: state.isFocused ? '#86b7fe' : '#dee2e6'
    }
  }),
  multiValue: (base) => ({
    ...base,
    backgroundColor: '#0d6efd',
  }),
  multiValueLabel: (base) => ({
    ...base,
    color: '#ffffff',
  }),
  multiValueRemove: (base) => ({
    ...base,
    color: '#ffffff',
    ':hover': {
      backgroundColor: '#0b5ed7',
      color: '#ffffff',
    },
  }),
}

export default selectCustomStyles
