import propTypes from 'prop-types'
import { CollectionPlay } from 'react-bootstrap-icons'

import LibraryStatistics from '../components/LibraryStats'
import TrackList from '../components/TrackList'

const LibraryView = ({ mixxxStats, sampleTracks }) => (
  <div className="text-center py-5">
    <h2 className="d-flex justify-content-center align-items-center">
      <CollectionPlay className="me-1"/>
      Library
    </h2>
    <p className="text-muted">Browse your Mixxx music library...</p>

    {mixxxStats && (<LibraryStatistics mixxxStats={mixxxStats} />)}
    {sampleTracks.length > 0 && (<TrackList tracks={sampleTracks} />)}
  </div>
)

LibraryView.propTypes = {
  mixxxStats: propTypes.object,
  sampleTracks: propTypes.array.isRequired
}

export default LibraryView
