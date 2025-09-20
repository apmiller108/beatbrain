import propTypes from 'prop-types'
import { CollectionPlay } from 'react-bootstrap-icons'

import LibraryStatistics from '../components/LibraryStats'
import TrackList from '../components/TrackList'

const LibraryView = ({ mixxxStats, sampleTracks }) => (
  <div>
    <h2 className="mb-4 d-flex justify-content-start align-items-center">
      <CollectionPlay className="me-2" />
      Library
    </h2>

    {mixxxStats && <LibraryStatistics mixxxStats={mixxxStats} />}
    {sampleTracks.length > 0 && <TrackList tracks={sampleTracks} />}
  </div>
)

LibraryView.propTypes = {
  mixxxStats: propTypes.object,
  sampleTracks: propTypes.array.isRequired,
}

export default LibraryView
