import { useState } from 'react'
import PropTypes from 'prop-types'
import { Badge, Button } from 'react-bootstrap'
import { Trash3, GripVertical, InfoCircleFill } from 'react-bootstrap-icons'
import OverlayTrigger from 'react-bootstrap/OverlayTrigger'
import Tooltip from 'react-bootstrap/Tooltip'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import formatDuration from '../../utilities/formatDuration'
import { toCamelot, toTraditional } from '../../utilities/musicalKeys'
import TrackInfoModal from '../TrackInfoModal'

const PlaylistTrackItem = ({ track, onRemove, disabled, keyNotation = 'original' }) => {
  const [showModal, setShowModal] = useState(false)
  const [trackInfo, setTrackInfo] = useState(null)

  const sortable = useSortable({ id: track.id })

  const style = {
    transform: CSS.Transform.toString(sortable.transform),
    transition: sortable.transition,
    opacity: sortable.isDragging ? 0.5 : 1,
    backgroundColor: sortable.isDragging ? '#f8f9fa' : 'transparent',
    cursor: disabled ? 'not-allowed' : 'default'
  }

  const showTrackInfo = async (sourceTrackId) => {
    const trackInfo = await window.api.mixxx.getTrackById(sourceTrackId)
    setTrackInfo(trackInfo)
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setTrackInfo(null)
  }

  const formatKey = (key) => {
    if (keyNotation === 'camelot') {
      return toCamelot(key)
    } else if (keyNotation === 'traditional') {
      return toTraditional(key)
    } else {
      return key
    }
  }

  return (
    <>
      <tr id={`track-${track.id}`} ref={sortable.setNodeRef} style={style} className="c-playlist-track-item">
        <td className="text-muted">
          <div className="d-flex align-items-center">
            <GripVertical className="me-2 grip-icon" style={{ cursor: 'grab' }} {...sortable.attributes} {...sortable.listeners} />
            <span>{track.position + 1}</span>
          </div>
        </td>
        <td>
          <Button variant="outline-secondary" size="sm" onClick={() => { showTrackInfo(track.source_track_id) } }>
            <InfoCircleFill />
          </Button>
        </td>
        <td>
          <strong>{track.title || 'Unknown Title'}</strong>
        </td>
        <td>{track.artist || 'Unknown Artist'}</td>
        <td className="text-muted">{track.album || '-'}</td>
        <td>
          {track.bpm ? (
            <Badge bg="secondary">{Math.round(track.bpm)}</Badge>
          ) : (
            '-'
          )}
        </td>
        <td>
          {track.key ? (
            <Badge bg="primary">{formatKey(track.key)}</Badge>
          ) : (
            '-'
          )}
        </td>
        <td className="text-muted">
          {track.duration ? formatDuration(track.duration) : '-'}
        </td>
        <td>
          <OverlayTrigger overlay={<Tooltip>Remove Track</Tooltip>}>
            <Button variant="link" className="text-danger" onClick={() => onRemove(track.id)}>
              <Trash3 />
            </Button>
          </OverlayTrigger>
        </td>
      </tr>

      <TrackInfoModal show={showModal} onHide={handleCloseModal} track={trackInfo} keyNotation={keyNotation} trackKey={formatKey(track.key)}/>
    </>
  )
}

PlaylistTrackItem.propTypes = {
  track: PropTypes.shape({
    id: PropTypes.number.isRequired,
    title: PropTypes.string,
    artist: PropTypes.string,
    album: PropTypes.string,
    bpm: PropTypes.number,
    key: PropTypes.string,
    duration: PropTypes.number,
    position: PropTypes.number.isRequired
  }).isRequired,
  onRemove: PropTypes.func.isRequired,
  disabled: PropTypes.bool
}

export default PlaylistTrackItem
