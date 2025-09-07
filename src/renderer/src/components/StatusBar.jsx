import { Navbar, Container } from 'react-bootstrap';
import propTypes from 'prop-types'

const StatusBar = ({ mixxxStatus }) => {
  const getStatusIndicator = () => {
    if (mixxxStatus.isConnected) {
      return <>🟢 Connected to <code>{mixxxStatus.dbPath}</code></>;
    }
    if (!mixxxStatus.dbPath) {
      return <>⚪ Not Configured</>;
    }
    return <>🔴 Disconnected</>;
  };

  return (
    <Navbar fixed="bottom" bg="light" variant="light" className="border-top">
      <Container fluid className="px-4">
        <small>{getStatusIndicator()}</small>
      </Container>
    </Navbar>
  );
};

StatusBar.propTypes = {
  mixxxStatus: propTypes.shape({
    isConnected: propTypes.bool.isRequired,
    dbPath: propTypes.string,
  }).isRequired,
};

export default StatusBar;
