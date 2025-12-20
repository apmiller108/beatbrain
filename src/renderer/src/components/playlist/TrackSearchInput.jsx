import { useState, useEffect } from 'react'
import propTypes from 'prop-types'
import { Form, InputGroup } from 'react-bootstrap'
import { Search } from 'react-bootstrap-icons'
import useDebounce from '../../hooks/useDebounced'

const TrackSearchInput = ({ value, onChange }) => {
  const [localValue, setLocalValue] = useState(value)

  const debouncedSearchTerm = useDebounce(localValue, 300)

  useEffect(() => {
    if (localValue === value) return
    onChange(localValue)
  }, [debouncedSearchTerm])

  return (
    <InputGroup className="mb-3">
      <InputGroup.Text>
        <Search />
      </InputGroup.Text>
      <Form.Control
        type="text"
        placeholder="Search by track name, artist, album..."
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        autoFocus
      />
    </InputGroup>
  )
}

TrackSearchInput.propTypes = {
  value: propTypes.string.isRequired,
  onChange: propTypes.func.isRequired,
}

export default TrackSearchInput
