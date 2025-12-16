import { useState, useEffect, useMemo } from 'react'
import PropTypes from 'prop-types'
import { Form } from 'react-bootstrap'
import Select from 'react-select'
import selectCustomStyles from './selectCustomStyles'
import { toCamelot, toTraditional } from '../../utilities/musicalKeys'

const KeyMultiSelect = ({ keys, value, onChange, disabled }) => {
  // Normalize keys into a map of camelot label to original keys
  // A single camelot key can map to multiple traditional keys depending on notation
  // (e.g., "8A (Am)", "Amin" and "Am" all map to "8A")
  const normalizedKeys = () => {
    const map = {}
    keys.forEach(key => {
      const camelot = toCamelot(key)
      const traditional = toTraditional(key)
      const label = `${camelot} (${traditional})`

      if (!map[label]) {
        map[label] = new Set()
      }
      map[label].add(key)
    })

    return map
  }

  const options = useMemo(() => {
    const map = normalizedKeys()
    // properly sort keys in musical order 1A, 1B, ... 12A, 12B
    return Object.keys(map).sort((a, b) => {
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
  }, [keys])

  const handleChange = (selected) => {
    onChange(selected || [])
  }

  return (
    <Form.Group className="mb-3">
      <Form.Label>Keys</Form.Label>
      <Select
        isMulti
        options={options}
        value={value}
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
