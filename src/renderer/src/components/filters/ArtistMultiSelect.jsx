import propTypes from 'prop-types'
import { Form } from 'react-bootstrap'
import Select from 'react-select'
import selectCustomStyles from './selectCustomStyles'

const ArtistMultiSelect = ({ artists, value, onChange, disabled }) => {
  const options = artists.map(artist => ({
    value: artist,
    label: artist
  }))

  const selectedOptions = value.map(artist => ({
    value: artist,
    label: artist
  }))

  const handleChange = (selected) => {
    const selectedArtists = selected ? selected.map(option => option.value) : []
    onChange(selectedArtists)
  }

  return (
    <Form.Group className="mb-3">
      <Form.Label>Artists</Form.Label>
      <Select
        isMulti
        options={options}
        value={selectedOptions}
        onChange={handleChange}
        placeholder="All artists"
        isDisabled={disabled || artists.length === 0}
        styles={selectCustomStyles}
        classNamePrefix="react-select"
      />
    </Form.Group>
  )
}

ArtistMultiSelect.propTypes = {
  artists: propTypes.arrayOf(propTypes.string).isRequired,
  value: propTypes.arrayOf(propTypes.string).isRequired,
  onChange: propTypes.func.isRequired,
  disabled: propTypes.bool,
}

export default ArtistMultiSelect
