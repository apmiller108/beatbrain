import { useState, useEffect } from 'react'
import {
  Container,
  Navbar,
  Alert,
  Row,
  Col
} from 'react-bootstrap'

import PlaylistsView from './views/PlaylistsView'
import LibraryView from './views/LibraryView'
import SettingsView from './views/SettingsView'
import Navigation from './components/Navigation'
import StatusBar from './components/StatusBar'
import DatabaseConnectionModal from './components/DatabaseConnectionModal'
import logo from './assets/beatbrain_logo.png'

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
  const [showConnectionModal, setShowConnectionModal] = useState(false);

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

    async function initialize() {
      await loadAppInfo()

      // Check if user has a saved preference for auto-connecting
      const autoConnect = await window.api.getUserPreference('database', 'auto_connect')
      const savedDbPath = await window.api.getUserPreference('database', 'path')

      if (autoConnect === 'true') {
        // User chose to remember their choice - auto connect
        const success = await connectToMixxx(savedDbPath || null)
        if (success) {
          await loadMixxxData()
        } else {
          // Auto-connect failed, show modal
          setShowConnectionModal(true)
        }
      } else if (autoConnect === 'false') {
        // User chose not to connect automatically
        await loadMixxxStatus()
      } else {
        // First time user - show connection modal
        await loadMixxxStatus()
        setShowConnectionModal(true)
      }
    }

    initialize()

  }, [])

  const loadMixxxData = async () => {
    const status = await window.api.mixxx.getStatus()
    setMixxxStatus(status)
    const stats = await window.api.mixxx.getStats()
    setMixxxStats(stats)
    const tracks = await window.api.mixxx.getSampleTracks(5)
    setSampleTracks(tracks)
  }

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

  const handleModalConnect = async (dbPath, rememberChoice) => {
    try {
      setLoading(true)
      const result = await window.api.mixxx.connect(dbPath)

      if (result.success) {
        if (rememberChoice) {
          await window.api.setUserPreference('database', 'auto_connect', 'true')
          await window.api.setUserPreference('database', 'path', result.path || '')
        }

        await loadMixxxData()
        return true
      } else {
        const status = await window.api.mixxx.getStatus()
        setMixxxStatus(status)
        return false
      }
    } catch (error) {
      console.error('Failed to connect to Mixxx:', error)
      return false
    } finally {
      setLoading(false)
    }
  }

  const handleModalHide = async () => {
    setShowConnectionModal(false)
    // Save preference that user skipped
    await window.api.setUserPreference('database', 'auto_connect', 'false')
  }

  const handleManualFileSelect = async () => {
    try {
      const filePath = await window.api.selectDatabaseFile()
      return filePath
    } catch (error) {
      console.error('Failed to select file:', error)
      return null
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
            <Container className="mt-3">
              <Navbar bg="dark" variant="dark" expand="md" className="shadow mb-4">
                <Container>
                  <Navbar.Brand className="p-2">
                    <div className="d-flex justify-content-start align-items-center">
                      <img className="beatbrain-logo" src={logo} alt="BeatBrain"/>
                      <span className="ms-4">BeatBrain</span>
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

      <DatabaseConnectionModal
        show={showConnectionModal}
        onHide={handleModalHide}
        onConnect={handleModalConnect}
        onManualSelect={handleManualFileSelect}
        mixxxStatus={mixxxStatus}
        loading={loading}
      />

      <StatusBar mixxxStatus={mixxxStatus} loading={loading} appInfo={appInfo} />
    </div>
  )
}

export default App
