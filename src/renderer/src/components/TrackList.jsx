import { Card, Table } from 'react-bootstrap'
import propTypes from 'prop-types'
import { MusicNoteBeamed } from 'react-bootstrap-icons'
import { formatDuration } from '../utilities'

function TrackList({ tracks }) {
  return (
    <Card className="mt-4 shadow-sm">
      <Card.Header className="bg-dark text-white">
        <h5 className="mb-0"><MusicNoteBeamed className="me-2" /> Sample Tracks</h5>
      </Card.Header>
      <Card.Body>
        <Table responsive striped hover>
          <thead>
            <tr>
              <th>Artist</th>
              <th>Title</th>
              <th>Genre</th>
              <th>BPM</th>
              <th>Key</th>
              <th>Duration</th>
            </tr>
          </thead>
          <tbody>
            {tracks.map((track, index) => (
              <tr key={index}>
                <td>{track.artist || 'Unknown'}</td>
                <td>{track.title || 'Unknown'}</td>
                <td>{track.genre || 'N/A'}</td>
                <td>{track.bpm ? Math.round(track.bpm) : 'N/A'}</td>
                <td>{track.key || 'N/A'}</td>
                <td>{track.duration ? formatDuration(track.duration) : 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  );
}

TrackList.propTypes = {
  tracks: propTypes.arrayOf(
    propTypes.shape({
      artist: propTypes.string,
      title: propTypes.string,
      genre: propTypes.string,
      bpm: propTypes.number,
      key: propTypes.string,
      duration: propTypes.number
    })
  ).isRequired
}

export default TrackList
