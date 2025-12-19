import propTypes from 'prop-types'
import { Modal, Badge, Row, Col } from 'react-bootstrap'
import formatDuration from '../utilities/formatDuration'
import formatDate from '../utilities/formatDate'
import { formatKey } from '../utilities/musicalKeys'

const TrackInfoModal = ({ show, onHide, track, keyNotation }) => {
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

  if (!track) return null

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
        <InfoRow label="In Crates" value={track.crates.map(c => c.name).join(', ')} />

        <hr className="my-3" />

        <InfoRow label="BPM" value={track.bpm ? Math.round(track.bpm) : null} badge badgeVariant="secondary" />
        <InfoRow label="Key" value={track.key} badge badgeVariant="primary" />
        {keyNotation !== 'original' && (
          <InfoRow label={`Key (${keyNotation})`} value={formatKey(track.key, keyNotation)} badge badgeVariant="primary" />
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
  show: propTypes.bool.isRequired,
  onHide: propTypes.func.isRequired,
  track: propTypes.shape({
    id: propTypes.number,
    title: propTypes.string,
    artist: propTypes.string,
    album: propTypes.string,
    grouping: propTypes.string,
    year: propTypes.string,
    datetime_added: propTypes.string,
    genre: propTypes.string,
    duration: propTypes.number,
    bpm: propTypes.number,
    bpm_lock: propTypes.number,
    rating: propTypes.number,
    key: propTypes.string,
    comment: propTypes.string,
    timesplayed: propTypes.number,
    last_played_at: propTypes.string,
    bitrate: propTypes.number,
    samplerate: propTypes.number,
    filetype: propTypes.string,
    file_path: propTypes.string,
    crates: propTypes.arrayOf(
      propTypes.shape({
        id: propTypes.number,
        name: propTypes.string
      })
    )
  }),
  keyNotation: propTypes.oneOf(['original', 'camelot', 'openkey']).isRequired
}

export default TrackInfoModal
