import { Alert } from "react-bootstrap";
import propTypes from "prop-types";
import { CheckCircleFill, ExclamationCircleFill, ExclamationTriangleFill } from "react-bootstrap-icons";

export function  FlashMessage({
  variant = "primary", // 'success', 'danger', 'warning', 'primary'
  heading,
  icon,
  message, // string or element
  className = "",
  onClose,
  dismissible = false,
  action, // for optional button or element on the right
  ...rest
}) {

  const defaultIcons = {
    success: <CheckCircleFill size={20} className="text-success" />,
    primary: <CheckCircleFill size={20} className="text-success" />,
    danger: <ExclamationCircleFill size={20} className="text-danger" />,
    warning: <ExclamationTriangleFill size={20} />,
  };

  const iconToShow = icon || defaultIcons[variant]

  return (
    <Alert
      variant={variant}
      className={`c-flash-message ${className}`}
      onClose={onClose}
      dismissible={dismissible}
      {...rest}
    >
      <div className="d-flex align-items-center justify-content-between w-100">
        <div className="d-flex align-items-center">
          <div>
            {heading && (
              <div className="d-flex align-items-center mb-2">
                {iconToShow && <span className="me-2">{iconToShow}</span>}
                <Alert.Heading className="m-0">{heading}</Alert.Heading>
              </div>
            )}
            {message && (
              <div className="d-flex align-items-center">
                {!heading && iconToShow && (
                  <span className="me-2">{iconToShow}</span>
                )}
                <div className="mb-0">{message}</div>
              </div>
            )}
          </div>
        </div>
        {action && <div className="ms-3">{action}</div>}
      </div>
    </Alert>
  );
}

FlashMessage.propTypes = {
  variant: propTypes.string,
  heading: propTypes.oneOfType([propTypes.string, propTypes.element]),
  icon: propTypes.element,
  children: propTypes.node,
  className: propTypes.string,
  onClose: propTypes.func,
  dismissible: propTypes.bool,
  action: propTypes.element,
  message: propTypes.oneOfType([propTypes.string, propTypes.element]),
};

export default FlashMessage;
