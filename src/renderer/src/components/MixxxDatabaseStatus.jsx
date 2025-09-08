import { Card, Button, Alert, Spinner } from 'react-bootstrap'
import propTypes from 'prop-types'
import { MusicNoteBeamed } from 'react-bootstrap-icons'

function MixxxDatabaseStatus({
  mixxxStatus,
  onConnect,
  onDisconnect,
  loading = false
}) {
  const handleConnect = async () => await onConnect()
  const handleDisconnect = async () => await onDisconnect()

  return (
    <Card className="shadow-sm h-100 database-status">
      <Card.Header className={`text-white ${mixxxStatus.isConnected ? 'bg-success' : 'bg-warning'}`}>
        <h5 className="mb-0"><MusicNoteBeamed className="me-2" /> Mixxx Database Status</h5>
      </Card.Header>
      <Card.Body>
        <div className="d-flex align-items-center mb-3">
          <div className={`status-indicator ${mixxxStatus.isConnected ? 'bg-success' : 'bg-danger'} me-2`}></div>
          <span className={mixxxStatus.isConnected ? 'text-success' : 'text-danger'}>
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
              onClick={handleConnect}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Spinner size="sm" className="me-2" />
                  Connecting...
                </>
              ) : (
                'Connect to Mixxx'
              )}
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
    defaultPath: propTypes.string.isRequired
  }).isRequired,
  onConnect: propTypes.func,
  onDisconnect: propTypes.func,
  loading: propTypes.bool
}

export default MixxxDatabaseStatus
