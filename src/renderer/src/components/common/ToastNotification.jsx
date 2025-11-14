import {Toast, ToastContainer } from 'react-bootstrap'
import { CheckCircleFill, ExclamationCircleFill } from 'react-bootstrap-icons'
import PropTypes from 'prop-types'

const ToastNotification = ({ message, details, type, show, onClose, delay = 5000 }) => {
  return (
      <ToastContainer position="top-center"
                      className="p-3"
                      style={{ position: 'fixed', zIndex: 9999 }}>
        <Toast
          show={show}
          onClose={onClose}
          delay={delay}
          autohide
          bg={type === 'success' ? 'success' : 'danger'}
        >
          <Toast.Header closeButton={true}>
            {type === 'success' ? (
              <CheckCircleFill className="me-2" size={16} />
            ) : (
              <ExclamationCircleFill className="me-2" size={16} />
            )}
            <strong className="me-auto">
              {type === 'success' ? 'Success' : 'Error'}
            </strong>
          </Toast.Header>
          <Toast.Body className="text-white">
            <div className="mb-1"><strong>{message}</strong></div>
            {details && (
              <small>{details}</small>
            )}
          </Toast.Body>
        </Toast>
      </ToastContainer>
  )
}

ToastNotification.propTypes = {
  message: PropTypes.string.isRequired,
  details: PropTypes.string,
  type: PropTypes.oneOf(['success', 'error']).isRequired,
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  delay: PropTypes.number
}

export default ToastNotification
