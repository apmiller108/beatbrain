import { useState, useEffect } from 'react'
import { Container, Navbar, Row, Col } from 'react-bootstrap'

import PlaylistCreationView from './views/PlaylistCreationView'
import PlaylistDetailView from './views/PlaylistDetailView'
import LibraryView from './views/LibraryView'
import SettingsView from './views/SettingsView'
import Navigation from './components/Navigation'
import StatusBar from './components/StatusBar'
import ToastNotification from './components/common/ToastNotification'
import DatabaseConnectionModal from './components/DatabaseConnectionModal'
import logo from './assets/beatbrain_logo.png'

function App() {
  const [currentView, setCurrentView] = useState('playlists')
  const [activePlaylistId, setActivePlaylistId] = useState(null)

  const [appInfo, setAppInfo] = useState({
    version: 'Loading...',
    platform: 'Loading...',
    userDataPath: 'Loading...',
  })
  const [mixxxStatus, setMixxxStatus] = useState({})
  const [mixxxStats, setMixxxStats] = useState(null)
  const [sampleTracks, setSampleTracks] = useState([])
  const [loading, setLoading] = useState(false)
  const [showConnectionModal, setShowConnectionModal] = useState(false)
  const [databasePreferences, setDatabasePreferences] = useState({})
  const [deletedPlaylistId, setDeletedPlaylistId] = useState(null)
  const [createdPlaylistId, setCreatedPlaylistId] = useState(null)
  const [updatedPlaylist, setUpdatedPlaylist] = useState(null)

  const [notification, setNotification] = useState({
    show: false,
    type: 'success', // 'success' or 'error'
    message: '',
    details: '',
    autohide: true,
    filePath: null
  })

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

    async function initialize() {
      await loadAppInfo()

      const databasePreferences = await loadDatabasePreferences()

      await loadMixxxStatus()

      // Check if user has a saved preference for auto-connecting
      const autoConnect = databasePreferences.auto_connect
      const savedDbPath = databasePreferences.path

      if (autoConnect === 'true') {
        handleConnectToMixxx(savedDbPath)
      } else {
        setShowConnectionModal(true)
      }

      await loadMixxxStatus()
    }

    initialize()
  }, [])

  const loadMixxxStatus = async () => {
    try {
      const status = await window.api.mixxx.getStatus()
      setMixxxStatus(status)
      if (status.isConnected) {
        loadMixxxData()
      }
      return status
    } catch (error) {
      console.error('Failed to load Mixxx status:', error)
    }
  }

  const loadDatabasePreferences = async () => {
    try {
      const prefs = await window.api.getUserPreferencesForCategory('database')
      setDatabasePreferences(prefs)
      return prefs
    } catch (error) {
      console.error('Failed to load database preferences:', error)
    }
  }

  const loadMixxxData = async () => {
    const status = await window.api.mixxx.getStatus()
    setMixxxStatus(status)
    const stats = await window.api.mixxx.getStats()
    setMixxxStats(stats)
    const tracks = await window.api.mixxx.getSampleTracks(5)
    setSampleTracks(tracks)
  }

  const handleConnectToMixxx = async dbPath => {
    try {
      setLoading(true)
      const result = await window.api.mixxx.connect(dbPath || null)
      if (result.success) {
        loadMixxxData()
      } else {
        setShowConnectionModal(true)
      }
      return result
    } catch (error) {
      console.error('Failed to connect to Mixxx:', error)
    } finally {
      loadMixxxStatus()
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

  const handleConnectionModalConnect = async (dbPath, rememberChoice) => {
    const result = await handleConnectToMixxx(dbPath)

    if (result.success) {
      if (rememberChoice) {
        await window.api.setUserPreference('database', 'auto_connect', 'true')
        await window.api.setUserPreference(
          'database',
          'path',
          result.path || ''
        )
      } else {
        await window.api.setUserPreference('database', 'auto_connect', 'false')
        await window.api.setUserPreference('database', 'path', '')
      }

      loadDatabasePreferences()

      return true
    } else {
      return false
    }
  }

  const handleConnectionModalHide = async () => {
    setShowConnectionModal(false)
  }

  const handleManualDatabaseFileSelect = async () => {
    try {
      const filePath = await window.api.selectDatabaseFile()
      return filePath
    } catch (error) {
      console.error('Failed to select file:', error)
      return null
    }
  }

  const handleShowConnectionModal = () => {
    setShowConnectionModal(!showConnectionModal)
  }

  const handleSetView = (view) => {
    if (view !== 'playlist-detail') {
      setActivePlaylistId(null)
    }
    setCurrentView(view)
  }

  const handleSelectPlaylist = (playlistId) => {
    setActivePlaylistId(playlistId)
    setCurrentView('playlist-detail')
  }

  const handlePlaylistDeleted = (playlistId) => {
    setActivePlaylistId(null)
    setCurrentView('playlists')
    setDeletedPlaylistId(playlistId)
  }

  const handlePlaylistUpdated = (playlistId, updatedData) => {
    setUpdatedPlaylist({ id: playlistId, ...updatedData })
  }

  const handlePlaylistCreated = (playlistId) => {
    setCreatedPlaylistId(playlistId)
    setActivePlaylistId(playlistId)
    setCurrentView('playlist-detail')
  }

  const playlistCreationView = () => {
    return (
      <PlaylistCreationView mixxxStats={mixxxStats}
                            mixxxStatus={mixxxStatus}
                            onPlaylistCreated={handlePlaylistCreated}
                            handleShowConnectionModal={handleShowConnectionModal}
                            setNotification={setNotification}/>
    )
  }

  // Render current view
  const renderCurrentView = () => {
    switch (currentView) {
      case 'library':
        return (
          <LibraryView mixxxStats={mixxxStats} sampleTracks={sampleTracks} />
        )
      case 'playlists':
      return playlistCreationView()
      case 'playlist-detail':
      return <PlaylistDetailView playlistId={activePlaylistId}
                                 onPlaylistDeleted={handlePlaylistDeleted}
                                 onPlaylistUpdated={handlePlaylistUpdated}
                                 setNotification={setNotification} />
      case 'settings':
        return (
          <SettingsView
            appInfo={appInfo}
            mixxxStatus={mixxxStatus}
            onConnect={handleConnectToMixxx}
            onDisconnect={handleDisconnect}
            handleShowConnectionModal={handleShowConnectionModal}
            loading={loading}
          />
        )
      default:
        return playlistCreationView()
    }
  }

  return (
    <div className="App">
      <ToastNotification
        message={notification.message}
        details={notification.details}
        type={notification.type}
        show={notification.show}
        filePath={notification.filePath}
        autohide={notification.autohide}
        onClose={() => setNotification(prev => ({ ...prev, show: false }))}
      />
      <Container fluid className="pb-5">
        <Row>
          <Col xs={2} sm={2} className="p-0">
            <Navigation view={currentView}
                        setView={handleSetView}
                        onSelectPlaylist={handleSelectPlaylist}
                        deletedPlaylistId={deletedPlaylistId}
                        createdPlaylistId={createdPlaylistId}
                        updatedPlaylist={updatedPlaylist}
                        activePlaylistId={activePlaylistId}/>
          </Col>
          <Col xs={10} xm={10}>
            <Container className="mt-3">
              {renderCurrentView()}
            </Container>
          </Col>
        </Row>
      </Container>

      <DatabaseConnectionModal
        show={showConnectionModal}
        onHide={handleConnectionModalHide}
        onConnect={handleConnectionModalConnect}
        onManualSelect={handleManualDatabaseFileSelect}
        onDisconnect={handleDisconnect}
        mixxxStatus={mixxxStatus}
        databasePreferences={databasePreferences}
        loading={loading}
      />

      <StatusBar
        mixxxStatus={mixxxStatus}
        loading={loading}
        appInfo={appInfo}
        handleShowConnectionModal={handleShowConnectionModal}
      />
    </div>
  )
}

export default App
