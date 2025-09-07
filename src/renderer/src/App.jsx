import { useState, useEffect } from 'react'
import {
  Container,
  Navbar,
  Alert,
  Badge,
  Row,
  Col
} from 'react-bootstrap'
import { Headphones } from 'react-bootstrap-icons';

import PlaylistsView from './views/PlaylistsView'
import LibraryView from './views/LibraryView'
import SettingsView from './views/SettingsView'
import Navigation from './components/Navigation'
import StatusBar from './components/StatusBar'

function App() {
  const [currentView, setCurrentView] = useState('playlists')

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

  // Render current view
  const renderCurrentView = () => {
    switch (currentView) {
      case 'library':
        return <LibraryView
                 mixxxStats={mixxxStats}
                 sampleTracks={sampleTracks}
               />
      case 'playlists':
        return <PlaylistsView />
      case 'settings':
        return (
          <SettingsView
            appInfo={appInfo}
            mixxxStatus={mixxxStatus}
            onConnect={handleConnectToMixxx}
            onDisconnect={handleDisconnect}
            loading={loading}
          />
        )
      default:
        return <PlaylistsView />
    }
  }

  return (
    <div className="App">
      <Container fluid>
        <Row>
          <Col md={2} className="p-0">
            <Navigation view={currentView} setView={setCurrentView} />
          </Col>
          <Col md={10}>
            <Container className="mt-4">
              <Navbar bg="dark" variant="dark" expand="md" className="shadow mb-4">
                <Container>
                  <Navbar.Brand>
                    <div className="d-flex justify-content-start align-items-center">
                      <Headphones color="royalblue" size={30} />
                      <span className="mx-2">BeatBrain</span>
                      <Badge bg="secondary" className="ms-2">v{appInfo.version}</Badge>
                    </div>
                  </Navbar.Brand>
                </Container>
              </Navbar>

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

              {/* Render the current view */}
              {renderCurrentView()}
            </Container>
          </Col>
        </Row>
      </Container>
      <StatusBar mixxxStatus={mixxxStatus} />
    </div>
  )
}

export default App
