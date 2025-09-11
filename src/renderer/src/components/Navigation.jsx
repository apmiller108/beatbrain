import { Nav } from 'react-bootstrap';
import propTypes from 'prop-types';
import { Gear, CollectionPlay, MusicNoteList } from 'react-bootstrap-icons';

const Navigation = ({ view, setView }) => {
  return (
    <Nav
      variant="pills"
      className="flex-column bg-light p-3"
      activeKey={view}
      onSelect={(selectedKey) => setView(selectedKey)}
    >
      <Nav.Item>
        <Nav.Link eventKey="library">
          <CollectionPlay className="me-2" /> Library
        </Nav.Link>
      </Nav.Item>
      <Nav.Item>
        <Nav.Link eventKey="playlists">
          <MusicNoteList className="me-2" /> Playlists
        </Nav.Link>
      </Nav.Item>
      <Nav.Item>
        <Nav.Link eventKey="settings">
          <Gear className="me-2" /> Settings
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
