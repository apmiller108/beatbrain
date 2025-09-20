import { useState, useEffect } from 'react'
import { Modal, Button, Alert, Form, Spinner } from 'react-bootstrap'
import { MusicNote, CheckCircleFill } from 'react-bootstrap-icons'

import PropTypes from 'prop-types'

function DatabaseConnectionModal({
  show,
  onHide,
  onConnect,
  onManualSelect,
  onDisconnect,
  mixxxStatus,
  databasePreferences,
  loading = false,
}) {
  const [rememberChoice, setRememberChoice] = useState(false)
  const [selectedOption, setSelectedOption] = useState('auto') // 'auto' or 'manual'
  const [manualPath, setManualPath] = useState('')

  useEffect(() => {
    // If there is a default path and the user hasn't manually set a different one, select 'auto'
    if (
      mixxxStatus.defaultPathExists &&
      !(
        databasePreferences.path &&
        databasePreferences.path !== mixxxStatus.defaultPath
      )
    ) {
      setSelectedOption('auto')
    } else {
      setSelectedOption('manual')
    }

    if (databasePreferences.auto_connect !== undefined) {
      setRememberChoice(
        databasePreferences.auto_connect === 'true' ? true : false
      )
    }

    if (
      databasePreferences.path &&
      databasePreferences.path !== mixxxStatus.defaultPath
    ) {
      setManualPath(databasePreferences.path)
    }
  }, [mixxxStatus, databasePreferences])

  const handleConnect = async () => {
    let dbPath = null

    if (selectedOption === 'manual' && manualPath.trim()) {
      dbPath = manualPath.trim()
    }

    const success = await onConnect(dbPath, rememberChoice)
    if (success) {
      onHide()
    }
  }

  const handleManualFileSelect = async () => {
    const path = await onManualSelect()
    if (path) {
      setManualPath(path)
      setSelectedOption('manual')
    }
  }

  return (
    <Modal
      show={show}
      onHide={onHide}
      backdrop="static"
      keyboard={false}
      centered
      size="lg"
      className="database-connection-modal"
    >
      <Modal.Header>
        <Modal.Title className="d-flex align-items-center">
          <MusicNote className="me-2" />
          {mixxxStatus.isConnected
            ? 'Mixxx Database'
            : 'Connect to Mixxx Database'}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <div className="mb-4">
          {mixxxStatus.isConnected ? (
            <Alert variant="success">
              <div className="d-flex align-items-center" />
              <CheckCircleFill className="text-success me-2" />
              BeatBrain is currently connected to your Mixxx database at
              <div className="mt-2">
                <code>{mixxxStatus.dbPath}</code>
              </div>
            </Alert>
          ) : (
            <p className="text-muted">
              BeatBrain needs to connect to your Mixxx database to access your
              music library.
            </p>
          )}
        </div>

        {!mixxxStatus.isConnected && (
          <div className="database-connection-form">
            {mixxxStatus.defaultPathExists && (
              <div className="mb-4">
                <Form.Check
                  type="radio"
                  id="auto-detect"
                  name="connectionOption"
                  className="auto-detect-option"
                  label={
                    <div>
                      <strong>Use auto-detected database</strong>
                      <div className="small text-muted mt-1">
                        <code>{mixxxStatus.defaultPath}</code>
                      </div>
                    </div>
                  }
                  checked={selectedOption === 'auto'}
                  onChange={() => setSelectedOption('auto')}
                />
              </div>
            )}

            <div className="mb-4">
              <Form.Check
                type="radio"
                id="manual-select"
                name="connectionOption"
                label="Select database file"
                checked={selectedOption === 'manual'}
                onChange={() => setSelectedOption('manual')}
              />

              {selectedOption === 'manual' && (
                <div className="mt-3 ms-4">
                  <div className="d-flex gap-2 mb-2">
                    <Form.Control
                      type="text"
                      placeholder="Select mixxxdb.sqlite file..."
                      value={manualPath}
                      onChange={e => setManualPath(e.target.value)}
                      readOnly
                    />
                    <Button
                      variant="outline-secondary"
                      onClick={handleManualFileSelect}
                      disabled={loading}
                    >
                      Browse...
                    </Button>
                  </div>
                  <div className="small text-muted">
                    Look for <code>mixxxdb.sqlite</code> in your Mixxx
                    installation directory
                  </div>
                </div>
              )}
            </div>

            {mixxxStatus.lastError && (
              <Alert variant="danger" className="mb-3">
                <strong>Connection Error:</strong> {mixxxStatus.lastError}
              </Alert>
            )}

            <Form.Check
              type="checkbox"
              id="remember-choice"
              label="Remember my choice and don't ask again"
              checked={rememberChoice}
              onChange={e => setRememberChoice(e.target.checked)}
              className="mb-3"
            />

            <div className="small text-muted">
              <strong>Note:</strong>
              You can always change your database connection in Settings later.
            </div>
          </div>
        )}
      </Modal.Body>

      {mixxxStatus.isConnected ? (
        <Modal.Footer className="disconnect-button">
          <Button variant="secondary" onClick={onHide}>
            Cancel
          </Button>
          <Button variant="primary" onClick={onDisconnect}>
            Disconnect
          </Button>
        </Modal.Footer>
      ) : (
        <Modal.Footer className="connect-button">
          <Button variant="secondary" onClick={onHide} disabled={loading}>
            Skip for now
          </Button>
          <Button
            variant="primary"
            onClick={handleConnect}
            disabled={
              loading || (selectedOption === 'manual' && !manualPath.trim())
            }
          >
            {loading ? (
              <>
                <Spinner size="sm" className="me-2" />
                Connecting...
              </>
            ) : (
              'Connect'
            )}
          </Button>
        </Modal.Footer>
      )}
    </Modal>
  )
}

DatabaseConnectionModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
  onConnect: PropTypes.func.isRequired,
  onDisconnect: PropTypes.func.isRequired,
  onManualSelect: PropTypes.func.isRequired,
  mixxxStatus: PropTypes.object.isRequired,
  databasePreferences: PropTypes.object.isRequired,
  loading: PropTypes.bool,
}

export default DatabaseConnectionModal
