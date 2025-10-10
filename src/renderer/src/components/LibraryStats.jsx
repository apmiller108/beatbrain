import { Card, Row, Col, Badge } from 'react-bootstrap'
import propTypes from 'prop-types'
import { formatDuration } from '../utilities'

function LibraryStatistics({ mixxxStats }) {
  return (
    <Card className="mt-4 shadow-sm">
      <Card.Header className="bg-info text-white">
        <h5 className="mb-0">📊 Library Statistics</h5>
      </Card.Header>
      <Card.Body>
        <Row className="g-4">
          <Col md={3}>
            <div className="text-center">
              <h3 className="text-primary">
                {mixxxStats.totalTracks.toLocaleString()}
              </h3>
              <p className="text-muted mb-0">Total Tracks</p>
            </div>
          </Col>
          <Col md={3}>
            <div className="text-center">
              <h3 className="text-success">{mixxxStats.totalCrates}</h3>
              <p className="text-muted mb-0">Crates</p>
            </div>
          </Col>
          <Col md={3}>
            <div className="text-center">
              <h3 className="text-warning">{mixxxStats.totalPlaylists}</h3>
              <p className="text-muted mb-0">Playlists</p>
            </div>
          </Col>
          <Col md={3}>
            <div className="text-center">
              <h3 className="text-info">
                {formatDuration(mixxxStats.totalDurationSeconds)}
              </h3>
              <p className="text-muted mb-0">Total Duration</p>
            </div>
          </Col>
        </Row>

        {mixxxStats.topGenres && mixxxStats.topGenres.length > 0 && (
          <div className="mt-4">
            <h6>Top Genres:</h6>
            <div className="d-flex flex-wrap gap-2">
              {mixxxStats.topGenres.map((genre, index) => (
                <Badge key={index} bg="secondary">
                  {genre.genre} ({genre.count})
                </Badge>
              ))}
            </div>
          </div>
        )}

        {mixxxStats.bpmRange && (
          <div className="mt-3">
            <h6>BPM Range:</h6>
            <p className="mb-0">
              {Math.round(mixxxStats.bpmRange.minBpm)} -{' '}
              {Math.round(mixxxStats.bpmRange.maxBpm)} BPM
            </p>
          </div>
        )}
      </Card.Body>
    </Card>
  )
}

LibraryStatistics.propTypes = {
  mixxxStats: propTypes.shape({
    totalTracks: propTypes.number.isRequired,
    totalCrates: propTypes.number.isRequired,
    totalPlaylists: propTypes.number.isRequired,
    totalDurationSeconds: propTypes.number.isRequired,
    topGenres: propTypes.arrayOf(
      propTypes.shape({
        genre: propTypes.string.isRequired,
        count: propTypes.number.isRequired,
      })
    ),
    bpmRange: propTypes.shape({
      minBpm: propTypes.number,
      maxBpm: propTypes.number,
      avgBpm: propTypes.number,
    }),
  }),
}

export default LibraryStatistics
