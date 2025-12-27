import { Form, InputGroup, Row, Col } from 'react-bootstrap';
import propTypes from 'prop-types';
import { Speedometer2 } from 'react-bootstrap-icons';

const BpmRangeInput = ({
  minValue,
  maxValue,
  onChange,
  minBpm = 0,
  maxBpm = 300,
  disabled = false
}) => {
  const handleMinChange = (e) => {
    const newMin = parseInt(e.target.value, 10);
    onChange({ minBpm: isNaN(newMin) ? null : newMin, maxBpm: maxValue });
  };

  const handleMaxChange = (e) => {
    const newMax = parseInt(e.target.value, 10);
    onChange({ minBpm: minValue, maxBpm: isNaN(newMax) ? null : newMax });
  };

  const handleMinBlur = (e) => {
    let newMin = parseInt(e.target.value, 10);

    // minValue must be less than or equal to maxBpm and not less than minBpm
    if (isNaN(newMin)) {
      newMin = null
    } else if (newMin < minBpm) {
      newMin = minBpm;
    } else if (newMin > maxBpm) {
      newMin = maxBpm;
    }

    // Ensure min doesn't exceed max
    if (maxValue && newMin && newMin > maxValue) {
      newMin = maxValue;
    }

    onChange({ minBpm: newMin, maxBpm: maxValue });
  };

  const handleMaxBlur = (e) => {
    let newMax = parseInt(e.target.value, 10);

    // maxValue must be greater than or equal to minBpm and not greater than maxBpm
    if (isNaN(newMax)) {
      newMax = null
    } else if (newMax < minBpm) {
      newMax = minBpm;
    } else if (newMax > maxBpm) {
      newMax = maxBpm;
    }

    // Ensure max doesn't go below min
    if (minValue && newMax && newMax < minValue) {
      newMax = minValue;
    }

    onChange({ minBpm: minValue, maxBpm: newMax });
  };

  return (
    <Form.Group className="mb-3">
      <Form.Label>
        <Speedometer2 className="me-2" />
        BPM Range
      </Form.Label>
      <Row className="g-2">
        <Col>
          <InputGroup>
            <InputGroup.Text>Min</InputGroup.Text>
            <Form.Control
              type="number"
              value={minValue || ''}
              onChange={handleMinChange}
              onBlur={handleMinBlur}
              min={minBpm}
              max={maxBpm}
              step="1"
              disabled={disabled}
              placeholder="Min BPM"
            />
          </InputGroup>
        </Col>
        <Col xs="auto" className="d-flex align-items-center">
          <span className="text-muted">to</span>
        </Col>
        <Col>
          <InputGroup>
            <InputGroup.Text>Max</InputGroup.Text>
            <Form.Control
              type="number"
              value={maxValue || ''}
              onChange={handleMaxChange}
              onBlur={handleMaxBlur}
              min={minBpm}
              max={maxBpm}
              step="1"
              disabled={disabled}
              placeholder="Max BPM"
            />
          </InputGroup>
        </Col>
      </Row>
    </Form.Group>
  );
};

BpmRangeInput.propTypes = {
  minValue: propTypes.number,
  maxValue: propTypes.number,
  onChange: propTypes.func.isRequired,
  minBpm: propTypes.number,
  maxBpm: propTypes.number,
  disabled: propTypes.bool,
};

export default BpmRangeInput;
