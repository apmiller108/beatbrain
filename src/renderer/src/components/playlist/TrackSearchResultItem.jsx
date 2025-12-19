import { useState, useEffect } from 'react'
import propTypes from 'prop-types'
import { Form, Button, Badge } from 'react-bootstrap'
import { InfoCircle } from 'react-bootstrap-icons'
import TrackInfoModal from '../TrackInfoModal'
import { formatKey } from '../../utilities/musicalKeys'

const TrackSearchResultItem = ({
  track,
  isSelected,
  isInPlaylist,
  onToggle,
  keyNotation = 'original'
}) => {
  const [showInfoModal, setShowInfoModal] = useState(false)
  const [showInfoTrack, setShowInfoTrack] = useState(null)

  const onShowInfo = async () => {
    const infoTrack = await window.api.mixxx.getTrackById(track.id)
    setShowInfoTrack(infoTrack)
    setShowInfoModal(true)
  }

  return (
    <div
      className={`d-flex align-items-center py-1 px-2 border-bottom ${
        isInPlaylist ? 'text-muted bg-light' : ''
      }`}
      style={{ cursor: isInPlaylist ? 'not-allowed' : 'pointer' }}
    >
      <Form.Check
        type="checkbox"
        checked={isSelected || isInPlaylist}
        onChange={() => onToggle(track.id)}
        disabled={isInPlaylist}
      />

      <Button variant="link" className="flex-grow-1 text-decoration-none" onClick={() => !isInPlaylist && onToggle(track.id)}>
        <div className="fw-bold">
          {track.title || 'Unknown Title'}
          {isInPlaylist && <span className="ms-2 badge bg-secondary">In Playlist</span>}
        </div>
        <div className="small text-muted">
          {track.artist || 'Unknown Artist'}
          {track.album && ` • ${track.album}`}
        </div>
      </Button>

      <div className="text-end small me-3 d-flex flex-column justify-content-between" >
        <Badge bg="secondary" className="mb-1">
          {track.bpm ? `${Math.round(track.bpm)} BPM` : 'No BPM'}
        </Badge>
        <Badge bg="primary">
          {formatKey(track.key, keyNotation) || 'No Key'}
        </Badge>
      </div>

      <InfoCircle
        size={26}
        className="text-primary"
        style={{ cursor: 'pointer' }}
        onClick={onShowInfo}
      />

      <TrackInfoModal
        show={showInfoModal}
        onHide={() => setShowInfoModal(false)}
        track={showInfoTrack}
        keyNotation={keyNotation}
      />
    </div>
  )
}

TrackSearchResultItem.propTypes = {
  track: propTypes.shape({
    id: propTypes.number.isRequired,
    title: propTypes.string,
    artist: propTypes.string,
    album: propTypes.string,
    bpm: propTypes.number,
    key: propTypes.string,
  }).isRequired,
  isSelected: propTypes.bool.isRequired,
  isInPlaylist: propTypes.bool.isRequired,
  onToggle: propTypes.func.isRequired,
  onShowInfo: propTypes.func.isRequired,
}

export default TrackSearchResultItem
