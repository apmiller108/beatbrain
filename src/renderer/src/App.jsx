import React, { useState, useEffect } from 'react'
import {
  Container,
  Navbar,
  Nav,
  Card,
  Button,
  Alert,
  Badge,
} from 'react-bootstrap'

function App() {
  const [appInfo, setAppInfo] = useState({
    version: 'Loading...',
    platform: 'Loading...',
    userDataPath: 'Loading...',
  })
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

    loadAppInfo()
  }, [])

  const getPlatformIcon = platform => {
    switch (platform) {
      case 'win32':
        return '🪟'
      case 'darwin':
        return '🍎'
      case 'linux':
        return '🐧'
      default:
        return '💻'
    }
  }
  return (
    <div className="App">
      {/* Navigation Bar */}
      <Navbar bg="dark" variant="dark" expand="lg" className="shadow">
        <Container>
          <Navbar.Brand>
            🎧 BeatBrain
            <Badge bg="secondary" className="ms-2">
              v{appInfo.version}
            </Badge>
          </Navbar.Brand>
          <Nav className="me-auto">
            <Nav.Link href="#library">📚 Library</Nav.Link>
            <Nav.Link href="#playlists">📝 Playlists</Nav.Link>
            <Nav.Link href="#settings">⚙️ Settings</Nav.Link>
          </Nav>
        </Container>
      </Navbar>

      {/* Main Content */}
      <Container className="mt-4">
        {showAlert && (
          <Alert
            variant="success"
            dismissible
            onClose={() => setShowAlert(false)}
            className="shadow-sm">
            <Alert.Heading>🎉 Welcome to BeatBrain!</Alert.Heading>
            <p>
              Your AI-powered DJ library management tool is ready to go! This
              Electron + React + Vite setup gives you a solid foundation for
              building amazing features.
            </p>
            <hr />
            <p className="mb-0">
              <strong>Next:</strong> We&apos;ll integrate with your Mixxx
              database and add Claude AI capabilities.
            </p>
          </Alert>
        )}

        <div className="row g-4">
          <div className="col-lg-6">
            <Card className="shadow-sm h-100">
              <Card.Header className="bg-primary text-white">
                <h5 className="mb-0">📱 System Information</h5>
              </Card.Header>
              <Card.Body>
                <div className="row g-3">
                  <div className="col-sm-6">
                    <strong>Platform:</strong>
                    <div className="mt-1">
                      {getPlatformIcon(appInfo.platform)} {appInfo.platform}
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <strong>Version:</strong>
                    <div className="mt-1">
                      <Badge bg="info">{appInfo.version}</Badge>
                    </div>
                  </div>
                  <div className="col-12">
                    <strong>User Data Path:</strong>
                    <div className="mt-1">
                      <code className="small text-muted">
                        {appInfo.userDataPath}
                      </code>
                    </div>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="d-flex align-items-center">
                    <div className="status-indicator bg-success me-2"></div>
                    <span className="text-success">Application Running</span>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </div>

          <div className="col-lg-6">
            <Card className="shadow-sm h-100">
              <Card.Header className="bg-success text-white">
                <h5 className="mb-0">🚀 Development Progress</h5>
              </Card.Header>
              <Card.Body>
                <div className="progress-item mb-3">
                  <div className="d-flex justify-content-between align-items-center">
                    <span>✅ Electron + React + Vite Setup</span>
                    <Badge bg="success">Complete</Badge>
                  </div>
                </div>
                <div className="progress-item mb-3">
                  <div className="d-flex justify-content-between align-items-center">
                    <span>⏳ Mixxx Database Integration</span>
                    <Badge bg="warning">Next</Badge>
                  </div>
                </div>
                <div className="progress-item mb-3">
                  <div className="d-flex justify-content-between align-items-center">
                    <span>⏳ Library Display & Search</span>
                    <Badge bg="secondary">Pending</Badge>
                  </div>
                </div>
                <div className="progress-item mb-3">
                  <div className="d-flex justify-content-between align-items-center">
                    <span>⏳ Claude AI Integration</span>
                    <Badge bg="secondary">Pending</Badge>
                  </div>
                </div>
                <div className="progress-item">
                  <div className="d-flex justify-content-between align-items-center">
                    <span>⏳ M3U Playlist Export</span>
                    <Badge bg="secondary">Pending</Badge>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </div>
        </div>

        <Card className="mt-4 shadow-sm">
          <Card.Header className="bg-info text-white">
            <h5 className="mb-0">🎵 Planned Features</h5>
          </Card.Header>
          <Card.Body>
            <div className="row g-4">
              <div className="col-md-4">
                <div className="feature-preview">
                  <h6>📚 Smart Library Browser</h6>
                  <p className="text-muted small">
                    Browse your entire Mixxx collection with advanced sorting,
                    filtering, and search capabilities. View track metadata,
                    BPM, keys, and more.
                  </p>
                </div>
              </div>
              <div className="col-md-4">
                <div className="feature-preview">
                  <h6>🤖 AI Music Assistant</h6>
                  <p className="text-muted small">
                    Chat with Claude about your music library. Get intelligent
                    playlist suggestions based on genre, BPM, energy, and your
                    personal taste.
                  </p>
                </div>
              </div>
              <div className="col-md-4">
                <div className="feature-preview">
                  <h6>📝 Playlist Generation</h6>
                  <p className="text-muted small">
                    Export AI-generated playlists as M3U files that you can
                    import directly into Mixxx for your DJ sets.
                  </p>
                </div>
              </div>
            </div>
            <div className="text-center mt-4">
              <Button variant="primary" size="lg">
                🔨 Let&apos;s Start Building!
              </Button>
            </div>
          </Card.Body>
        </Card>
      </Container>
    </div>
  )
}

export default App
