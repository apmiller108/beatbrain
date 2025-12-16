import PropTypes from 'prop-types'
import { Form } from 'react-bootstrap'
import Select from 'react-select'
import selectCustomStyles from './selectCustomStyles'

const CrateMultiSelect = ({ crates, value, onChange, disabled }) => {
  // Transform crates array into react-select format
  const options = crates.map(crate => ({
    value: crate.id,
    label: crate.name
  }))

  return (
    <Form.Group className="mb-3">
      <Form.Label>Crates</Form.Label>
      <Select
        isMulti
        options={options}
        value={value}
        onChange={onChange}
        placeholder="All crates"
        isDisabled={disabled || crates.length === 0}
        styles={selectCustomStyles}
        classNamePrefix="react-select"
      />
    </Form.Group>
  )
}

CrateMultiSelect.propTypes = {
  crates: PropTypes.arrayOf(PropTypes.string).isRequired,
  value: PropTypes.arrayOf(PropTypes.string).isRequired,
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
}

CrateMultiSelect.defaultProps = {
  disabled: false,
}

export default CrateMultiSelect
