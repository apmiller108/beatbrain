import PropTypes from 'prop-types'
import { Badge, Button } from 'react-bootstrap'
import { Trash3, GripVertical } from 'react-bootstrap-icons'
import OverlayTrigger from 'react-bootstrap/OverlayTrigger'
import Tooltip from 'react-bootstrap/Tooltip'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { formatDuration } from '../utilities'

const PlaylistTrackItem = ({ track, onRemove, disabled }) => {
  const sortable = useSortable({ id: track.id })

  const style = {
    transform: CSS.Transform.toString(sortable.transform),
    transition: sortable.transition,
    opacity: sortable.isDragging ? 0.5 : 1,
    backgroundColor: sortable.isDragging ? '#f8f9fa' : 'transparent',
    cursor: disabled ? 'not-allowed' : 'default'
  }

  return (
    <tr ref={sortable.setNodeRef} style={style} className="playlist-track-item">
      <td className="text-muted">
        <GripVertical className="me-2" style={{ cursor: 'grab' }} {...sortable.attributes} {...sortable.listeners} />
        {track.position + 1}
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
          <Badge bg="primary">{track.key}</Badge>
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
  onRemove: PropTypes.func.isRequired
}

export default PlaylistTrackItem
