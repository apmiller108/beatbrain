import { useState, useEffect } from 'react'
import { Nav } from 'react-bootstrap'
import propTypes from 'prop-types'
import { Gear, CollectionPlay } from 'react-bootstrap-icons'
import PlaylistList from './Navigation/PlaylistList'

const Navigation = ({ view, setView, onSelectPlaylist, activePlaylistId }) => {
  const [playlists, setPlaylists] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadPlaylists()
  }, [])

  const loadPlaylists = async () => {
    try {
      setLoading(true)
      setError(null)
      const playlists = await window.api.getAllPlaylists()
      setPlaylists(playlists)
    } catch (err) {
      console.error('Failed to load playlists:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleNavSelect = (selectedKey) => {
    // Only handle non-playlist navigation items
    if (selectedKey !== 'playlist-detail') {
      setView(selectedKey)
    }
  }

  const handlePlaylistSelect = (playlistId) => {
    onSelectPlaylist(playlistId)
  }

  const handleCreateNewPlaylist = () => {
    setView('playlists')
  }

  // Determine active key for top-level nav items
  const getActiveKey = () => {
    if (view === 'playlist-detail') {
      return null // Don't highlight any top-level item when viewing a playlist
    }
    return view
  }

  return (
    <div className='c-navigation'>
      <Nav
        variant="pills"
        className="flex-column bg-light"
        activeKey={getActiveKey()}
        onSelect={handleNavSelect}
      >
        <Nav.Item>
          <Nav.Link eventKey="library">
            <CollectionPlay className="me-2" /> Library
          </Nav.Link>
        </Nav.Item>

        {/* Playlists Section with nested list */}
        <PlaylistList
          playlists={playlists}
          loading={loading}
          error={error}
          activePlaylistId={activePlaylistId}
          onSelectPlaylist={handlePlaylistSelect}
          onCreateNew={handleCreateNewPlaylist}
        />

        <Nav.Item className="mt-2">
          <Nav.Link eventKey="settings">
            <Gear className="me-2" /> Settings
          </Nav.Link>
        </Nav.Item>
      </Nav>
    </div>
  )
}

Navigation.propTypes = {
  view: propTypes.string.isRequired,
  setView: propTypes.func.isRequired,
  onSelectPlaylist: propTypes.func.isRequired,
  activePlaylistId: propTypes.number,
}

export default Navigation
