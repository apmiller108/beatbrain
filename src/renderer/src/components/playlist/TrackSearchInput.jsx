import { useState, useEffect } from 'react'
import { Form, InputGroup } from 'react-bootstrap'
import { Search } from 'react-bootstrap-icons'

export default function TrackSearchInput({ value, onChange }) {
  const [localValue, setLocalValue] = useState(value)

  // Debounce search
  useEffect(() => {
    if (localValue === value) return
    const timer = setTimeout(() => {
      onChange(localValue)
    }, 300)

    return () => clearTimeout(timer)
  }, [localValue])

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
