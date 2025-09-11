import { Navbar, Container, OverlayTrigger, Tooltip, Button } from 'react-bootstrap'
import {
  CheckCircleFill,
  XCircleFill,
  Circle,
  ExclamationTriangleFill
} from 'react-bootstrap-icons';
import propTypes from 'prop-types'

const StatusBar = ({ mixxxStatus, loading, appInfo }) => {
  const getStatusContent = () => {
    // Loading/retry state
    if (loading) {
      return {
        icon: <ExclamationTriangleFill className="text-warning" />,
        text: "Connecting to Mixxx database...",
        variant: "warning",
        tooltip: "Attempting to connect to database"
      };
    }

    // Connected state
    if (mixxxStatus.isConnected && mixxxStatus.dbPath) {
      return {
        icon: <CheckCircleFill className="text-success" />,
        text: "Connected to Mixxx database",
        variant: "success",
        tooltip: `Database: ${mixxxStatus.dbPath}`
      };
    }

    // Not configured state
    if (!mixxxStatus.dbPath) {
      return {
        icon: <Circle className="text-secondary" />,
        text: "Mixxx database not configured",
        variant: "secondary",
        tooltip: "No database path configured. Go to Settings to connect."
      };
    }

    // Disconnected/error state
    return {
      icon: <XCircleFill className="text-danger" />,
      text: "Disconnected from Mixxx database",
      variant: "danger",
      tooltip: mixxxStatus.lastError
        ? `Error: ${mixxxStatus.lastError}`
        : `Database path: ${mixxxStatus.dbPath}`
    };
  };

  const statusContent = getStatusContent()

  const handleDatabaseClick = () => {
    // This could open the connection modal or navigate to settings
    // logging for now
    console.log('Database status clicked')
  }

  return (
    <Navbar fixed="bottom" bg="light" variant="light" className="border-top shadow-sm">
      <Container fluid className="px-4">
        <OverlayTrigger
          placement="top"
          overlay={
            <Tooltip id="status-tooltip">
              {statusContent.tooltip}
            </Tooltip>
          }
        >
          <small className={`d-flex align-items-center text-${statusContent.variant}`}>
            <Button variant="outline-light" size="sm" onClick={handleDatabaseClick}>
              {statusContent.icon}
            </Button>
            <span>{statusContent.text}</span>
          </small>
        </OverlayTrigger>
        <small className="text-muted">
          BeatBrain v{appInfo.version}
        </small>
      </Container>
    </Navbar>
  );
};

StatusBar.propTypes = {
  mixxxStatus: propTypes.shape({
    isConnected: propTypes.bool.isRequired,
    dbPath: propTypes.string,
    lastError: propTypes.string,
  }).isRequired,
  loading: propTypes.bool.isRequired,
  appInfo: propTypes.shape({
    version: propTypes.string.isRequired,
  }).isRequired
};

export default StatusBar;
