import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { MusicNoteList } from 'react-bootstrap-icons'
import TrackCountInput from '../components/filters/TrackCountInput'

const PlaylistsView = ({ mixxxStats }) => {
  const [maxCount, setMaxCount] = useState(100)
  const [filters, setFilters] = useState({
    trackCount: 25,
    minBpm: null,
    maxBpm: null,
    genres: [],
  })

  useEffect(() => {
    if (mixxxStats?.totalTracks) {
      setMaxCount(mixxxStats.totalTracks)
    }
  }, [mixxxStats])

  return (
    <div>
      <h2 className="mb-4 d-flex justify-content-start align-items-center">
        <MusicNoteList className="me-2" />
        Playlists
      </h2>
      <TrackCountInput value={filters.trackCount}
                       onChange={(value) => setFilters(prev => ({...prev, trackCount: value}))}
                       max={maxCount} />
    </div>
  )
}

PlaylistsView.propTypes = {
  mixxxStats: PropTypes.object,
}

export default PlaylistsView
