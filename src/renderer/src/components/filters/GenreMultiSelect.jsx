import PropTypes from 'prop-types'
import { Form } from 'react-bootstrap'
import Select from 'react-select'

const GenreMultiSelect = ({ genres, value, onChange, disabled }) => {
  // Transform genres array into react-select format
  const options = genres.map(genre => ({
    value: genre,
    label: genre
  }))

  // Transform selected values into react-select format
  const selectedOptions = value.map(genre => ({
    value: genre,
    label: genre
  }))

  const handleChange = (selected) => {
    // Convert back to simple array of strings
    const selectedGenres = selected ? selected.map(option => option.value) : []
    onChange(selectedGenres)
  }

  // Custom styles to match Bootstrap theme
  const customStyles = {
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

  return (
    <Form.Group className="mb-3">
      <Form.Label>Genres</Form.Label>
      <Select
        isMulti
        options={options}
        value={selectedOptions}
        onChange={handleChange}
        placeholder="All genres"
        isDisabled={disabled || genres.length === 0}
        styles={customStyles}
        classNamePrefix="react-select"
      />
    </Form.Group>
  )
}

GenreMultiSelect.propTypes = {
  genres: PropTypes.arrayOf(PropTypes.string).isRequired,
  value: PropTypes.arrayOf(PropTypes.string).isRequired,
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
}

GenreMultiSelect.defaultProps = {
  disabled: false,
}

export default GenreMultiSelect
