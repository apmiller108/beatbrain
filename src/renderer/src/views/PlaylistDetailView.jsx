import { Button } from 'react-bootstrap'
import { ArrowLeft } from 'react-bootstrap-icons'
import propTypes from 'prop-types'

const PlaylistDetailView = ({ playlistId, onBack }) => {
  return (
    <div>
      <Button variant="link" onClick={onBack} className="mb-3 p-0">
        <ArrowLeft className="me-2" />
        Back to Playlists
      </Button>
      <h2>Playlist Detail View</h2>
      <p>Viewing playlist ID: {playlistId}</p>
      <p className="text-muted">Full implementation coming next...</p>
    </div>
  )
}

PlaylistDetailView.propTypes = {
  playlistId: propTypes.number.isRequired,
  onBack: propTypes.func.isRequired,
}

export default PlaylistDetailView
