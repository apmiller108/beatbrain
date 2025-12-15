import PropTypes from 'prop-types'
import { Modal, Badge, Row, Col } from 'react-bootstrap'
import formatDuration from '../utilities/formatDuration'
import formatDate from '../utilities/formatDate'

const TrackInfoModal = ({ show, onHide, track, keyNotation, trackKey }) => {
  if (!track) return null

  const InfoRow = ({ label, value, badge = false, badgeVariant = 'secondary' }) => (
    <Row className="mb-2">
      <Col xs={4} className="text-muted fw-semibold">
        {label}
      </Col>
      <Col xs={8}>
        {badge && value ? (
          <Badge bg={badgeVariant}>{value}</Badge>
        ) : (
          <span>{value || '-'}</span>
        )}
      </Col>
    </Row>
  )

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header className="border-bottom" closeButton>
        <Modal.Title>
          {track.title || 'Unknown Title'}
          <p className="text-muted m-0 fs-6">{track.artist || 'Unknown Artist'}</p>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>

        <InfoRow label="Album" value={track.album} />
        <InfoRow label="Label" value={track.grouping} />
        <InfoRow label="Year" value={track.year} />
        <InfoRow label="Genre" value={track.genre} />

        <hr className="my-3" />

        <InfoRow label="BPM" value={track.bpm ? Math.round(track.bpm) : null} badge badgeVariant="secondary" />
        <InfoRow label="Key" value={track.key} badge badgeVariant="primary" />
        {keyNotation !== 'original' && (
          <InfoRow label={`Key (${keyNotation})`} value={trackKey} badge badgeVariant="primary" />
        )}
        <InfoRow label="Duration" value={track.duration ? formatDuration(track.duration) : null} />
        <InfoRow label="Rating" value={track.rating ? `${track.rating}/5` : 'Not rated'} />

        <hr className="my-3" />

        <InfoRow label="Times Played" value={track.timesplayed} />
        <InfoRow label="Last Played" value={formatDate(track.last_played_at)} />
        <InfoRow label="Date Added" value={formatDate(track.datetime_added)} />

        <hr className="my-3" />

        <InfoRow label="Bitrate" value={track.bitrate ? `${track.bitrate} kbps` : null} />
        <InfoRow label="Sample Rate" value={track.samplerate ? `${track.samplerate} Hz` : null} />
        <InfoRow label="File Type" value={track.filetype?.toUpperCase()} />

        {track.comment && (
          <>
            <hr className="my-3" />
            <InfoRow label="Comment" value={track.comment} />
          </>
        )}

        <hr className="my-3" />

        <Row>
          <Col xs={4} className="text-muted fw-semibold">
            File Path
          </Col>
          <Col xs={8}>
            <a href="#" onClick={() => { window.api.openFile(track.file_path) }}>
              <small className="text-break font-monospace">{track.file_path || '-'}</small>
            </a>
          </Col>
        </Row>
      </Modal.Body>
    </Modal>
  )
}

TrackInfoModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
  track: PropTypes.shape({
    id: PropTypes.number,
    title: PropTypes.string,
    artist: PropTypes.string,
    album: PropTypes.string,
    grouping: PropTypes.string,
    year: PropTypes.string,
    datetime_added: PropTypes.string,
    genre: PropTypes.string,
    duration: PropTypes.number,
    bpm: PropTypes.number,
    bpm_lock: PropTypes.number,
    rating: PropTypes.number,
    key: PropTypes.string,
    comment: PropTypes.string,
    timesplayed: PropTypes.number,
    last_played_at: PropTypes.string,
    bitrate: PropTypes.number,
    samplerate: PropTypes.number,
    filetype: PropTypes.string,
    file_path: PropTypes.string
  })
}

export default TrackInfoModal
