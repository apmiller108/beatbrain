import { useState, useEffect } from 'react'
import {
  Container,
  Navbar,
  Nav,
  Card,
  Alert,
  Badge,
  Table,
  Row,
  Col
} from 'react-bootstrap'

import MixxxDatabaseStatus from './MixxxDatabaseStatus'
import SystemInformation from './SystemInformation'

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

    const connectToMixxx = async (dbPath) => {
      try {
        setLoading(true)
        const result = await window.api.mixxx.connect(dbPath)
        return result.success
      } catch (error) {
        console.error('Failed to connect to Mixxx:', error)
        return false
      } finally {
        setLoading(false)
      }
    }

    const loadMixxxStatus = async () => {
      try {
        const status = await window.api.mixxx.getStatus()
        setMixxxStatus(status)
      } catch (error) {
        console.error('Failed to load Mixxx status:', error)
      }
    }

    const loadMixxxStats = async () => {
      try {
        const statsResult = await window.api.mixxx.getStats()
        setMixxxStats(statsResult)
      } catch (error) {
        console.error('Failed to load Mixxx stats:', error)
      }
    }

    // TODO load sample tracks
    const loadSampleTracks = async () => {
      try {
        const tracksResult = await window.api.mixxx.getSampleTracks(5)
        setSampleTracks(tracksResult)
      } catch (error) {
        console.error('Failed to load sample tracks:', error)
      }
    }

    async function initialize() {
      loadAppInfo()
      await connectToMixxx()
      loadMixxxStatus()
      loadMixxxStats()
      loadSampleTracks()
    }

    initialize()

  }, [])

  const handleConnectToMixxx = async () => {
    try {
      setLoading(true)
      await window.api.mixxx.connect()

      const status = await window.api.mixxx.getStatus()
      setMixxxStatus(status)
      const stats = await window.api.mixxx.getStats()
      setMixxxStats(stats)
      const tracks = await window.api.mixxx.getSampleTracks(5)
      setSampleTracks(tracks)
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
            <SystemInformation appInfo={appInfo} />
          </Col>

          <Col lg={6}>
            <MixxxDatabaseStatus
              mixxxStatus={mixxxStatus}
              onConnect={handleConnectToMixxx}
              onDisconnect={handleDisconnect}
              loading={loading}
            />
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
