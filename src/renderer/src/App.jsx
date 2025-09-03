import { useState, useEffect } from 'react'
import {
  Container,
  Navbar,
  Nav,
  Card,
  Button,
  Alert,
  Badge,
  Spinner,
  Table,
  Row,
  Col
} from 'react-bootstrap'

function App() {
  const [appInfo, setAppInfo] = useState({
    version: 'Loading...',
    platform: 'Loading...',
    userDataPath: 'Loading...',
  })
  const [mixxxStatus, setMixxxStatus] = useState({
    isConnected: false,
    dbPath: null,
    lastError: null,
    defaultPaths: []
  })
  const [mixxxStats, setMixxxStats] = useState(null)
  const [sampleTracks, setSampleTracks] = useState([])
  const [loading, setLoading] = useState(false)
  const [showAlert, setShowAlert] = useState(true)

  useEffect(() => {
    const loadAppInfo = async () => {
      try {
        const version = await window.api.getVersion()
        const platform = await window.api.getPlatform()
        const userDataPath = await window.api.getPath('userData')

        setAppInfo({ version, platform, userDataPath })
      } catch (error) {
        console.error('Failed to load app info:', error)
        setAppInfo(prev => ({ ...prev, error: error.message }))
      }
    }

    const loadMixxxStatus = async () => {
      try {
        const status = await window.api.mixxx.getStatus()
        setMixxxStatus(status)

        // Try to auto-connect if not connected
        if (!status.isConnected) {
          await handleConnectToMixxx()
        }
      } catch (error) {
        console.error('Failed to load Mixxx status:', error)
      }
    }

    // TODO load mixxx library stats
    // TODO load sample tracks

    loadAppInfo()
    loadMixxxStatus()
  }, [])

  const handleConnectToMixxx = async () => {
    setLoading(true)
    try {
      const result = await window.api.mixxx.connect()
      const status = await window.api.mixxx.getStatus()
      setMixxxStatus(status)

      if (result.success) {
        // Load stats and sample tracks
        const statsResult = await window.api.mixxx.getStats()
        if (statsResult.success) {
          setMixxxStats(statsResult.data)
        }

        const tracksResult = await window.api.mixxx.getSampleTracks(5)
        if (tracksResult.success) {
          setSampleTracks(tracksResult.data)
        }
      }
    } catch (error) {
      console.error('Failed to connect to Mixxx:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDisconnect = async () => {
    try {
      await window.api.mixxx.disconnect()
      const status = await window.api.mixxx.getStatus()
      setMixxxStatus(status)
      setMixxxStats(null)
      setSampleTracks([])
    } catch (error) {
      console.error('Failed to disconnect:', error)
    }
  }

  const formatDuration = (seconds) => {
    if (!seconds) return 'N/A'
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}h ${minutes}m`
  }

  const getPlatformIcon = platform => {
    switch (platform) {
      case 'win32': return '🪟'
      case 'darwin': return '🍎'
      case 'linux': return '🐧'
      default: return '💻'
    }
  }

  return (
    <div className="App">
      <Navbar bg="dark" variant="dark" expand="md" className="shadow">
        <Container>
          <Navbar.Brand>
            🎧 BeatBrain
            <Badge bg="secondary" className="ms-2">v{appInfo.version}</Badge>
          </Navbar.Brand>
          <Navbar.Toggle></Navbar.Toggle>
          <Navbar.Collapse>
            <Nav className="me-auto">
              <Nav.Link href="#library">📚 Library</Nav.Link>
              <Nav.Link href="#playlists">📝 Playlists</Nav.Link>
              <Nav.Link href="#settings">⚙️ Settings</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container className="mt-4">
        {showAlert && (
          <Alert
            variant="success"
            dismissible
            onClose={() => setShowAlert(false)}
            className="shadow-sm">
            <Alert.Heading>🎉 Welcome to BeatBrain!</Alert.Heading>
            <p>
              Your AI-powered DJ library management tool is ready to go!
              {mixxxStatus.isConnected ?
                " We've successfully connected to your Mixxx database!" :
                " Let's connect to your Mixxx database to get started."
              }
            </p>
          </Alert>
        )}

        <Row className="g-4">
          <Col lg={6}>
            <Card className="shadow-sm h-100">
              <Card.Header className="bg-primary text-white">
                <h5 className="mb-0">📱 System Information</h5>
              </Card.Header>
              <Card.Body>
                <Row className="g-3">
                  <Col sm={6}>
                    <strong>Platform:</strong>
                    <div className="mt-1">
                      {getPlatformIcon(appInfo.platform)} {appInfo.platform}
                    </div>
                  </Col>
                  <Col sm={6}>
                    <strong>Version:</strong>
                    <div className="mt-1">
                      <Badge bg="info">{appInfo.version}</Badge>
                    </div>
                  </Col>
                  <Col xs={12}>
                    <strong>User Data Path:</strong>
                    <div className="mt-1">
                      <code className="small text-muted">
                        {appInfo.userDataPath}
                      </code>
                    </div>
                  </Col>
                </Row>
                <div className="mt-3">
                  <div className="d-flex align-items-center">
                    <div className="status-indicator bg-success me-2"></div>
                    <span className="text-success">Application Running</span>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={6}>
            <Card className="shadow-sm h-100">
              <Card.Header className={`text-white ${mixxxStatus.isConnected ? 'bg-success' : 'bg-warning'}`}>
                <h5 className="mb-0">🎵 Mixxx Database Status</h5>
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
                      onClick={handleConnectToMixxx}
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
          </Col>
        </Row>

        {/* Library Stats */}
        {mixxxStats && (
          <Card className="mt-4 shadow-sm">
            <Card.Header className="bg-info text-white">
              <h5 className="mb-0">📊 Library Statistics</h5>
            </Card.Header>
            <Card.Body>
              <Row className="g-4">
                <Col md={3}>
                  <div className="text-center">
                    <h3 className="text-primary">{mixxxStats.totalTracks.toLocaleString()}</h3>
                    <p className="text-muted mb-0">Total Tracks</p>
                  </div>
                </Col>
                <Col md={3}>
                  <div className="text-center">
                    <h3 className="text-success">{mixxxStats.totalCrates}</h3>
                    <p className="text-muted mb-0">Crates</p>
                  </div>
                </Col>
                <Col md={3}>
                  <div className="text-center">
                    <h3 className="text-warning">{mixxxStats.totalPlaylists}</h3>
                    <p className="text-muted mb-0">Playlists</p>
                  </div>
                </Col>
                <Col md={3}>
                  <div className="text-center">
                    <h3 className="text-info">{formatDuration(mixxxStats.totalDurationSeconds)}</h3>
                    <p className="text-muted mb-0">Total Duration</p>
                  </div>
                </Col>
              </Row>

              {mixxxStats.topGenres && mixxxStats.topGenres.length > 0 && (
                <div className="mt-4">
                  <h6>Top Genres:</h6>
                  <div className="d-flex flex-wrap gap-2">
                    {mixxxStats.topGenres.map((genre, index) => (
                      <Badge key={index} bg="secondary">
                        {genre.genre} ({genre.count})
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {mixxxStats.bpmRange && (
                <div className="mt-3">
                  <h6>BPM Range:</h6>
                  <p className="mb-0">
                    {Math.round(mixxxStats.bpmRange.minBpm)} - {Math.round(mixxxStats.bpmRange.maxBpm)} BPM
                    (avg: {Math.round(mixxxStats.bpmRange.avgBpm)})
                  </p>
                </div>
              )}
            </Card.Body>
          </Card>
        )}

        {/* Sample Tracks */}
        {sampleTracks.length > 0 && (
          <Card className="mt-4 shadow-sm">
            <Card.Header className="bg-dark text-white">
              <h5 className="mb-0">🎵 Sample Tracks</h5>
            </Card.Header>
            <Card.Body>
              <Table responsive striped hover>
                <thead>
                  <tr>
                    <th>Artist</th>
                    <th>Title</th>
                    <th>Genre</th>
                    <th>BPM</th>
                    <th>Key</th>
                    <th>Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {sampleTracks.map((track, index) => (
                    <tr key={index}>
                      <td>{track.artist || 'Unknown'}</td>
                      <td>{track.title || 'Unknown'}</td>
                      <td>{track.genre || 'N/A'}</td>
                      <td>{track.bpm ? Math.round(track.bpm) : 'N/A'}</td>
                      <td>{track.key || 'N/A'}</td>
                      <td>{track.duration ? formatDuration(track.duration) : 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        )}
      </Container>
    </div>
  )
}

export default App
