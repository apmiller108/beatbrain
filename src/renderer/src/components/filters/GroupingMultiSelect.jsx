import propTypes from 'prop-types'
import { Form } from 'react-bootstrap'
import Select from 'react-select'
import selectCustomStyles from './selectCustomStyles'

const GroupingMultiSelect = ({ groupings, value, onChange, disabled }) => {
  const options = groupings.map(grouping => ({
    value: grouping,
    label: grouping
  }))

  const selectedOptions = value.map(grouping => ({
    value: grouping,
    label: grouping
  }))

  const handleChange = (selected) => {
    const selectedGroups = selected ? selected.map(option => option.value) : []
    onChange(selectedGroups)
  }

  return (
    <Form.Group className="mb-3">
      <Form.Label>Groupings</Form.Label>
      <Select
        isMulti
        options={options}
        value={selectedOptions}
        onChange={handleChange}
        placeholder="All groupings"
        isDisabled={disabled || groupings.length === 0}
        styles={selectCustomStyles}
        classNamePrefix="react-select"
      />
    </Form.Group>
  )
}

GroupingMultiSelect.propTypes = {
  groupings: propTypes.arrayOf(propTypes.string).isRequired,
  value: propTypes.arrayOf(propTypes.string).isRequired,
  onChange: propTypes.func.isRequired,
  disabled: propTypes.bool,
}

export default GroupingMultiSelect
