import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { Form } from 'react-bootstrap'
import Select from 'react-select'
import selectCustomStyles from './selectCustomStyles'
import { toCamelot, toTraditional } from '../../utilities/musicalKeys'

const KeyMultiSelect = ({ keys, value, onChange, disabled }) => {
  const [options, setOptions] = useState([])

  useEffect(() => {
    const map = normalizedKeys()
    // properly sort keys in musical order 1A, 1B, ... 12A, 12B
    const opts = Object.keys(map).sort((a, b) => {
      const aNum = parseInt(a)
      const bNum = parseInt(b)
      const aLetter = a.slice(-1)
      const bLetter = b.slice(-1)

      if (aNum === bNum) {
        return aLetter.localeCompare(bLetter)
      }
      return aNum - bNum
    }).map(label => ({
      value: Array.from(map[label]),
      label: label
    }))
    setOptions(opts)
  }, [keys])

  const normalizedKeys = () => {
    const map = {}

    // For now we only support Camelot notation in the select
    keys.forEach(key => {
      const camelot = toCamelot(key)
      const label = `${camelot}`

      if (!map[label]) {
        map[label] = new Set()
      }
      map[label].add(key)
    })

    return map
  }

  // TODO reduce and normalize this show the tags show the camelot label
  // but keep the original keys in the value. The parent component might need to flatten the array
  // instead of doing it here
  const selectedOptions = value.map(key => ({
    value: key,
    label: key
  }))

  const handleChange = (selected) => {
    // Convert back to simple array of strings
    const selectedKeys = (selected ? selected.map(option => option.value) : []).flat()
    onChange(selectedKeys)
  }

  return (
    <Form.Group className="mb-3">
      <Form.Label>Keys</Form.Label>
      <Select
        isMulti
        options={options}
        value={selectedOptions}
        onChange={handleChange}
        placeholder="All keys"
        isDisabled={disabled || keys.length === 0}
        styles={selectCustomStyles}
        classNamePrefix="react-select"
      />
    </Form.Group>
  )
}

KeyMultiSelect.propTypes = {
  keys: PropTypes.arrayOf(PropTypes.string).isRequired,
  value: PropTypes.arrayOf(PropTypes.string).isRequired,
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
}

KeyMultiSelect.defaultProps = {
  disabled: false,
}

export default KeyMultiSelect
