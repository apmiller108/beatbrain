import { useState, useEffect } from 'react'
import {
  Container,
  Navbar,
  Nav,
  Alert,
  Badge,
  Row,
  Col
} from 'react-bootstrap'

import MixxxDatabaseStatus from './MixxxDatabaseStatus'
import SystemInformation from './SystemInformation'
import LibraryStatistics from './LibraryStats'
import TrackList from './TrackList'

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

        {mixxxStats && (<LibraryStatistics mixxxStats={mixxxStats} />)}

        {sampleTracks.length && (<TrackList tracks={sampleTracks} />)}

      </Container>
    </div>
  )
}

export default App
