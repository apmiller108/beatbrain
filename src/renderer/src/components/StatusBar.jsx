import { Navbar, Container, Button } from 'react-bootstrap'
import {
  CheckCircleFill,
  XCircleFill,
  Circle,
  ExclamationTriangleFill,
} from 'react-bootstrap-icons'
import propTypes from 'prop-types'

const StatusBar = ({
  mixxxStatus,
  loading,
  appInfo,
  handleShowConnectionModal,
}) => {
  const getStatusContent = () => {
    // Loading/retry state
    if (loading) {
      return {
        icon: <ExclamationTriangleFill className="text-warning" />,
        text: 'Connecting to Mixxx database...',
        variant: 'warning',
        tooltip: 'Attempting to connect to database',
      }
    }

    // Connected state
    if (mixxxStatus.isConnected && mixxxStatus.dbPath) {
      return {
        icon: <CheckCircleFill className="text-success" />,
        text: 'Connected to Mixxx database',
        variant: 'success',
      }
    }

    // Not configured state
    if (!mixxxStatus.dbPath) {
      return {
        icon: <Circle className="text-secondary" />,
        text: 'Mixxx database not configured',
        variant: 'secondary',
      }
    }

    // Disconnected/error state
    return {
      icon: <XCircleFill className="text-danger" />,
      text: 'Disconnected from Mixxx database',
      variant: 'danger',
    }
  }

  const statusContent = getStatusContent()

  return (
    <Navbar
      fixed="bottom"
      bg="light"
      variant="light"
      className="border-top shadow-sm status-bar"
    >
      <Container fluid className="px-4">
        <small
          className={`d-flex align-items-center text-${statusContent.variant}`}
        >
          <Button
            variant="outline-light"
            size="sm"
            className="database-connection-modal-opener"
            onClick={handleShowConnectionModal}
          >
            {statusContent.icon}
            <span className="ms-2">{statusContent.text}</span>
          </Button>
        </small>
        <small className="text-muted">BeatBrain v{appInfo.version}</small>
      </Container>
    </Navbar>
  )
}

StatusBar.propTypes = {
  mixxxStatus: propTypes.shape({
    isConnected: propTypes.bool.isRequired,
    dbPath: propTypes.string,
    lastError: propTypes.string,
  }).isRequired,
  loading: propTypes.bool.isRequired,
  appInfo: propTypes.shape({ version: propTypes.string.isRequired }).isRequired,
  handleShowConnectionModal: propTypes.func.required,
}

export default StatusBar
