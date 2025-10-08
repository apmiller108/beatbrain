import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { MusicNoteList } from 'react-bootstrap-icons'
import { Form } from 'react-bootstrap'
import TrackCountInput from '../components/filters/TrackCountInput'
import BpmRangeInput from '../components/filters/BpmRangeInput'

const PlaylistsView = ({ mixxxStats }) => {
  const [maxCount, setMaxCount] = useState(100)
  const [bpmRange, setBpmRange] = useState({ minBpm: 0, maxBpm: 300 })
  const [filters, setFilters] = useState({
    trackCount: 25,
    minBpm: null,
    maxBpm: null,
    genres: [],
  })

  useEffect(() => {
    if (mixxxStats) {
      setMaxCount(mixxxStats.totalTracks)
      setBpmRange({
        minBpm: Math.floor(mixxxStats.bpmRange.minBpm),
        maxBpm: Math.ceil(mixxxStats.bpmRange.maxBpm)
      })
    }
  }, [mixxxStats])

  return (
    <div>
      <h2 className="mb-4 d-flex justify-content-start align-items-center">
        <MusicNoteList className="me-2" />
        Playlists
      </h2>
      <Form>
        <TrackCountInput
          value={filters.trackCount}
          onChange={(value) => setFilters(prev => ({ ...prev, trackCount: value }))}
          max={maxCount} />
        <BpmRangeInput
          minBpm={bpmRange.minBpm}
          maxBpm={bpmRange.maxBpm}
          minValue={filters.minBpm}
          maxValue={filters.maxBpm}
          onChange={(value) => {
            console.log(value)
            setFilters(prev => ({ ...prev, ...value }))
          }} />
      </Form>
    </div>
  )
}

PlaylistsView.propTypes = {
  mixxxStats: PropTypes.object,
}

export default PlaylistsView
