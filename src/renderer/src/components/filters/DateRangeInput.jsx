import { Form, InputGroup, Row, Col, Button } from 'react-bootstrap'
import propTypes from 'prop-types'
import { Calendar } from 'react-bootstrap-icons'

const DateRangeInput = ({
  minValue,
  maxValue,
  onChange,
  minDate,
  maxDate,
  disabled = false,
  label = 'Date Range',
  icon = Calendar,
  granularity = 'date' // 'year' | 'date'
}) => {
  const Icon = icon
  const getInputType = () => {
    if (granularity === 'year') return 'number'
    return 'date'
  }

  const getPlaceholder = () => {
    if (granularity === 'year') return 'YYYY'
    return 'YYYY-MM-DD'
  }

  const formatDateForInput = (date) => {
    if (!date) return ''
    if (granularity === 'year') return String(date)

    return new Date(date).toISOString().slice(0, 10)
  }

  const handleMinChange = (e) => {
    const newMin = e.target.value || null
    onChange({ minDate: newMin, maxDate: maxValue })
  }

  const handleMaxChange = (e) => {
    const newMax = e.target.value || null
    onChange({ minDate: minValue, maxDate: newMax })
  }

  // Clamp values to be within min and max dates and prevent inverted ranges
  const handleMinBlur = (e) => {
    let newMin = e.target.value || null

    if (newMin && minDate && newMin < minDate) {
      newMin = minDate
    }
    if (newMin && maxDate && newMin > maxDate) {
      newMin = maxDate
    }
    if (maxValue && newMin && newMin > maxValue) {
      newMin = maxValue
    }

    onChange({ minDate: newMin, maxDate: maxValue })
  }

  const handleMaxBlur = (e) => {
    let newMax = e.target.value || null

    if (newMax && minDate && newMax < minDate) {
      newMax = minDate
    }
    if (newMax && maxDate && newMax > maxDate) {
      newMax = maxDate
    }
    if (minValue && newMax && newMax < minValue) {
      newMax = minValue
    }

    onChange({ minDate: minValue, maxDate: newMax })
  }

  const handleClear = () => {
    onChange({ minDate: null, maxDate: null })
  }

  return (
    <Form.Group className="mb-3">
      <Form.Label>
        <Icon className="me-2" />
        {label}
      </Form.Label>
      <Row className="g-2">
        <Col>
          <InputGroup>
            <InputGroup.Text>From</InputGroup.Text>
            <Form.Control
              type={getInputType()}
              value={formatDateForInput(minValue)}
              onChange={handleMinChange}
              onBlur={handleMinBlur}
              min={minDate}
              max={maxDate}
              disabled={disabled}
              placeholder={getPlaceholder()}
            />
          </InputGroup>
        </Col>
        <Col xs="auto" className="d-flex align-items-center">
          <span className="text-muted">to</span>
        </Col>
        <Col>
          <InputGroup>
            <InputGroup.Text>To</InputGroup.Text>
            <Form.Control
              type={getInputType()}
              value={formatDateForInput(maxValue)}
              onChange={handleMaxChange}
              onBlur={handleMaxBlur}
              min={minDate}
              max={maxDate}
              disabled={disabled}
              placeholder={getPlaceholder()}
            />
          </InputGroup>
        </Col>
        <Col xs="auto">
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={handleClear}
            disabled={disabled || (!minValue && !maxValue)}
            title="Clear date range"
          >
            ✕
          </Button>
        </Col>
      </Row>
    </Form.Group>
  )
}

DateRangeInput.propTypes = {
  minValue: propTypes.oneOfType([propTypes.string, propTypes.number]),
  maxValue: propTypes.oneOfType([propTypes.string, propTypes.number]),
  onChange: propTypes.func.isRequired,
  minDate: propTypes.oneOfType([propTypes.string, propTypes.number]),
  maxDate: propTypes.oneOfType([propTypes.string, propTypes.number]),
  disabled: propTypes.bool,
  label: propTypes.string,
  icon: propTypes.elementType,
  granularity: propTypes.oneOf(['year', 'date', 'datetime'])
}

export default DateRangeInput
