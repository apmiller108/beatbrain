import { Card, Button, Alert } from 'react-bootstrap'
import propTypes from 'prop-types'

function MixxxDatabaseStatus({
  mixxxStatus,
  onDisconnect,
  handleShowConnectionModal,
  loading = false,
}) {
  const handleDisconnect = async () => await onDisconnect()

  return (
    <Card className="shadow-sm h-100 database-status">
      <Card.Header
        className={`text-white ${mixxxStatus.isConnected ? 'bg-success' : 'bg-warning'}`}
      >
        <h5 className="mb-0">🎵 Mixxx Database Status</h5>
      </Card.Header>
      <Card.Body>
        <div className="d-flex align-items-center mb-3">
          <div
            className={`status-indicator ${mixxxStatus.isConnected ? 'bg-success' : 'bg-danger'} me-2`}
          ></div>
          <span
            className={mixxxStatus.isConnected ? 'text-success' : 'text-danger'}
          >
            {mixxxStatus.isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>

        {mixxxStatus.isConnected && mixxxStatus.dbPath && (
          <div className="mb-3">
            <strong>Database Path:</strong>
            <div className="mt-1">
              <code className="small text-muted">{mixxxStatus.dbPath}</code>
            </div>
          </div>
        )}

        {mixxxStatus.lastError && (
          <Alert variant="danger" className="small">
            <strong>Error:</strong> {mixxxStatus.lastError}
          </Alert>
        )}

        <div className="d-grid gap-2">
          {mixxxStatus.isConnected ? (
            <Button variant="outline-danger" onClick={handleDisconnect}>
              Disconnect
            </Button>
          ) : (
            <Button
              variant="success"
              onClick={handleShowConnectionModal}
              disabled={loading}
            >
              Configure Database
            </Button>
          )}
        </div>
      </Card.Body>
    </Card>
  )
}

MixxxDatabaseStatus.propTypes = {
  mixxxStatus: propTypes.shape({
    isConnected: propTypes.bool.isRequired,
    dbPath: propTypes.string,
    lastError: propTypes.string,
    defaultPath: propTypes.string.isRequired,
  }).isRequired,
  onDisconnect: propTypes.func,
  loading: propTypes.bool,
  handleShowConnectionModal: propTypes.func.isRequired,
}

export default MixxxDatabaseStatus
