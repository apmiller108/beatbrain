import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { MusicNoteList } from 'react-bootstrap-icons'
import TrackCountInput from '../components/filters/TrackCountInput'

const PlaylistsView = ({ mixxxStats }) => {
  const [count, setCount] = useState(1)
  const [maxCount, setMaxCount] = useState(25)

  useEffect(() => {
    if (mixxxStats && mixxxStats.totalTracks) {
      setMaxCount(mixxxStats.totalTracks)
    }
  }, [mixxxStats])

  return (
    <div>
      <h2 className="mb-4 d-flex justify-content-start align-items-center">
        <MusicNoteList className="me-2" />
        Playlists
      </h2>
      <TrackCountInput value={count} onChange={setCount} max={maxCount} />
    </div>
  )
}

PlaylistsView.propTypes = {
  mixxxStats: PropTypes.object,
}

export default PlaylistsView
