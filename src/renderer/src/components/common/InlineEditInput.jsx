import { useState, useRef } from 'react';
import { Button } from 'react-bootstrap';
import { Pencil } from 'react-bootstrap-icons';
import propTypes from 'prop-types';

const InlineEditInput = ({ value, onSave, id, slot }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(value);

  const inputRef = useRef(null);

  const onEdit = () => {
    setIsEditing(true);
    setTimeout(() => {
      const inputElement = inputRef.current;
      inputElement.focus();
      inputElement.select();
    })
  }
  const handleSave = () => {
    onSave(inputValue);
    setIsEditing(false);
  };

  return isEditing ? (
    <div className="d-flex align-items-center">
      <input
        className="form-control mb-2"
        ref={inputRef}
        type="text"
        id={id}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            handleSave()
          }
          if (e.key === 'Escape') {
            setIsEditing(false)
            setInputValue(value)
          }
        }}
        onBlur={handleSave}
      />
    </div>
  ) : (
    <div className="d-flex align-items-center justify-content-start">
      {slot ? slot : value}
      <Button variant="link" onClick={onEdit} className="ms-2"><Pencil/></Button>
    </div>
  );
}

InlineEditInput.propTypes = {
  value: propTypes.string.isRequired,
  onSave: propTypes.func.isRequired,
  id: propTypes.string,
  slot: propTypes.node
};

export default InlineEditInput;
