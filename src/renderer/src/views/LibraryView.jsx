import propTypes from 'prop-types'
import { CollectionPlay } from 'react-bootstrap-icons'

import LibraryStats from '../components/LibraryStats'
import TrackList from '../components/TrackList'

const LibraryView = ({ sampleTracks }) => {
  return (
    <div>
      <h2 className="mb-4 d-flex justify-content-start align-items-center">
        <CollectionPlay className="me-2" />
        Library
      </h2>

      <LibraryStats />
      {sampleTracks.length > 0 && <TrackList tracks={sampleTracks} />}
    </div>
  )
}

LibraryView.propTypes = {
  sampleTracks: propTypes.array.isRequired,
}

export default LibraryView
