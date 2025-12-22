import { Form, InputGroup } from 'react-bootstrap';
import { MusicNoteBeamed } from 'react-bootstrap-icons';
import propTypes from 'prop-types';

const TrackCountInput = ({
  value,
  onChange,
  min = 1,
  max,
  disabled = false
}) => {
  const handleChange = (e) => {
    const newValue = parseInt(e.target.value, 10);
    if (isNaN(newValue)) {
      onChange('');
    } else {
      onChange(newValue);
    }
  };

  const handleBlur = (e) => {
    let newValue = parseInt(e.target.value, 10);

    // Clamp value to min/max bounds. If empty or invalid, set to min.
    if (isNaN(newValue) || newValue < min) {
      newValue = min;
    } else if (newValue > max) {
      newValue = max;
    }

    onChange(newValue);
  };

  return (
    <Form.Group className="mb-3">
      <Form.Label htmlFor="track-count-input">
        <MusicNoteBeamed className="me-2" />
        Number of Tracks
      </Form.Label>
      <InputGroup>
        <Form.Control
          id="track-count-input"
          type="number"
          value={value || ''}
          onChange={handleChange}
          onBlur={handleBlur}
          step="1"
          min={min}
          max={max}
          disabled={disabled}
          placeholder={`Enter number (${min}-${max})`}
        />
        <InputGroup.Text>tracks</InputGroup.Text>
      </InputGroup>
      <Form.Text className="text-muted">
        Choose how many tracks to include in your playlist ({min}-{max})
      </Form.Text>
    </Form.Group>
  );
};

TrackCountInput.propTypes = {
  value: propTypes.oneOfType([propTypes.number, propTypes.string]).isRequired,
  onChange: propTypes.func.isRequired,
  min: propTypes.number,
  max: propTypes.number.isRequired,
  disabled: propTypes.bool,
}

export default TrackCountInput;
