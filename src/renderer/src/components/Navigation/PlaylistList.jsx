import { useState } from 'react'
import { Nav, Spinner, Badge, Button, Collapse } from 'react-bootstrap'
import { MusicNoteList, ChevronDown, ChevronRight, Plus } from 'react-bootstrap-icons'
import propTypes from 'prop-types'

const PlaylistList = ({ playlists, loading, error, activePlaylistId, onSelectPlaylist, onCreateNew }) => {
  const [isExpanded, setIsExpanded] = useState(true)

  const handlePlaylistClick = (playlistId) => {
    onSelectPlaylist(playlistId)
  }

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded)
  }

  return (
    <div className="playlist-navigation">
      {/* Playlists Header */}
      <div
        className="d-flex align-items-center justify-content-between px-3 py-2 playlist-header"
        style={{ cursor: 'pointer' }}
        onClick={toggleExpanded}
      >
        <div className="d-flex align-items-center">
          {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          <MusicNoteList className="mx-2" />
          <span>Playlists</span>
          {playlists.length > 0 && (
            <Badge bg="secondary" className="ms-2">
              {playlists.length}
            </Badge>
          )}
        </div>
        <Button
          variant="link"
          size="sm"
          className="p-0 text-decoration-none"
          onClick={(e) => {
            e.stopPropagation()
            onCreateNew()
          }}
          title="Create new playlist"
        >
          <Plus size={18} />
        </Button>
      </div>

      {/* Collapsible Playlist List */}
      <Collapse in={isExpanded}>
        <div>
          {loading && (
            <div className="text-center py-3">
              <Spinner animation="border" size="sm" />
            </div>
          )}

          {error && (
            <div className="text-danger small px-3 py-2">
              Failed to load playlists
            </div>
          )}

          {!loading && !error && playlists.length === 0 && (
            <div className="text-muted small px-3 py-2">
              No playlists yet
            </div>
          )}

          {!loading && !error && playlists.length > 0 && (
            <Nav className="flex-column">
              {playlists.map((playlist) => (
                <Nav.Item key={playlist.id}>
                  <Nav.Link
                    active={activePlaylistId === playlist.id}
                    onClick={() => handlePlaylistClick(playlist.id)}
                    className="ps-5 py-2 d-flex align-items-center justify-content-between"
                    style={{ cursor: 'pointer' }}
                  >
                    <span className="text-truncate" title={playlist.name}>
                      {playlist.name}
                    </span>
                    <Badge bg="light" text="dark" className="ms-2">
                      {playlist.track_count}
                    </Badge>
                  </Nav.Link>
                </Nav.Item>
              ))}
            </Nav>
          )}
        </div>
      </Collapse>
    </div>
  )
}

PlaylistList.propTypes = {
  playlists: propTypes.arrayOf(
    propTypes.shape({
      id: propTypes.number.isRequired,
      name: propTypes.string.isRequired,
      tracks: propTypes.array.isRequired,
    })
  ).isRequired,
  loading: propTypes.bool,
  error: propTypes.string,
  activePlaylistId: propTypes.number,
  onSelectPlaylist: propTypes.func.isRequired,
  onCreateNew: propTypes.func.isRequired,
}

export default PlaylistList
