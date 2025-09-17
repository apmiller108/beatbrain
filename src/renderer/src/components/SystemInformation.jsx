import { Card, Badge, Row, Col } from 'react-bootstrap'
import propTypes from 'prop-types'
import {
  Apple,
  InfoCircle,
  Laptop,
  Microsoft,
  Tux,
} from 'react-bootstrap-icons'

function SystemInformation({ appInfo }) {
  const getPlatformIcon = platform => {
    switch (platform) {
      case 'win32':
        return <Microsoft className="me-2" />
      case 'darwin':
        return <Apple className="me-2" />
      case 'linux':
        return <Tux className="me-2" />
      default:
        return <Laptop className="me-2" />
    }
  }

  return (
    <Card className="shadow-sm h-100">
      <Card.Header className="bg-primary text-white">
        <h5 className="mb-0">
          <InfoCircle className="me-2" /> System Information
        </h5>
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
              <code className="small text-muted">{appInfo.userDataPath}</code>
            </div>
          </Col>
        </Row>
        <div className="mt-3">
          <div className="d-flex align-items-center">
            <div className="status-indicator bg-success me-2"></div>
            <span className="text-success">Application Running</span>
          </div>
        </div>

        {appInfo.error && (
          <div className="mt-3">
            <div className="d-flex align-items-center">
              <div className="status-indicator bg-danger me-2"></div>
              <span className="text-danger">Error: {appInfo.error}</span>
            </div>
          </div>
        )}
      </Card.Body>
    </Card>
  )
}

SystemInformation.propTypes = {
  appInfo: propTypes.shape({
    version: propTypes.string.isRequired,
    platform: propTypes.string.isRequired,
    userDataPath: propTypes.string.isRequired,
    error: propTypes.string,
  }).isRequired,
}

export default SystemInformation
