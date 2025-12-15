import PropTypes from 'prop-types'
import { Form } from 'react-bootstrap'
import Select from 'react-select'
import selectCustomStyles from './selectCustomStyles'

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
        styles={selectCustomStyles}
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
