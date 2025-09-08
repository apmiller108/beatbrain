import { Row, Col } from 'react-bootstrap'
import { Gear } from 'react-bootstrap-icons';
import propTypes from 'prop-types'

import MixxxDatabaseStatus from '../components/MixxxDatabaseStatus'
import SystemInformation from '../components/SystemInformation'

const SettingsView = ({ appInfo, mixxxStatus, onConnect, onDisconnect, loading }) => (
  <div>
    <h2 className="mb-4 d-flex justify-content-start align-items-center">
      <Gear className="me-1"/>
      Settings
    </h2>
    <Row className="g-4">
      <Col lg={6}>
        <SystemInformation appInfo={appInfo} />
      </Col>
      <Col lg={6}>
        <MixxxDatabaseStatus
          mixxxStatus={mixxxStatus}
          onConnect={onConnect}
          onDisconnect={onDisconnect}
          loading={loading}
        />
      </Col>
    </Row>
  </div>
)

SettingsView.propTypes = {
  appInfo: propTypes.object.isRequired,
  mixxxStatus: propTypes.object.isRequired,
  onConnect: propTypes.func.isRequired,
  onDisconnect: propTypes.func.isRequired,
  loading: propTypes.bool.isRequired
}

export default SettingsView
