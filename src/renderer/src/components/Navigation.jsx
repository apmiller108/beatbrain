import { Nav } from 'react-bootstrap';
import { propTypes } from 'react-bootstrap/esm/Image';

const Navigation = ({ view, setView }) => {
  return (
    <Nav
      variant="pills"
      className="flex-column bg-light vh-100 p-3"
      activeKey={view}
      onSelect={(selectedKey) => setView(selectedKey)}
    >
      <Nav.Item>
        <Nav.Link eventKey="library">
          📚 Library
        </Nav.Link>
      </Nav.Item>
      <Nav.Item>
        <Nav.Link eventKey="playlists">
          📝 Playlists
        </Nav.Link>
      </Nav.Item>
      <Nav.Item>
        <Nav.Link eventKey="settings">
          ⚙️ Settings
        </Nav.Link>
      </Nav.Item>
    </Nav>
  );
};

Navigation.propTypes = {
  view: propTypes.string.isRequired,
  setView: propTypes.func.isRequired,
};

export default Navigation;
