import { useState, useEffect, useContext } from 'react'
import { MixxxStatsContext } from '../../contexts/MixxxStatsContext'
import { Modal, Button, Spinner } from 'react-bootstrap'
import TrackSearchInput from './TrackSearchInput'
import TrackSearchFilters from './TrackSearchFilters'

export default function TrackSearchModal({
  show,
  onHide,
  onExited,
  playlistTrackIds = [],
  onTracksAdded
}) {
  const [filterOptions, setFilterOptions] = useState({
    genres: [],
    keys: [],
    crates: []
  })
  const [filters, setFilters] = useState({
    query: '',
    bpmMin: null,
    bpmMax: null,
    genres: [],
    keys: [],
    crates: []
  })
  const [searchResults, setSearchResults] = useState([])
  const [selectedTracks, setSelectedTracks] = useState(new Set())
  const [searching, setSearching] = useState(false)

  const mixxxStats = useContext(MixxxStatsContext)

  useEffect(() => {
    loadSavedSearchFilters()
    loadFilterOptions()
  }, [])

  const loadSavedSearchFilters = async () => {
    try {
      const savedFilters = await window.api.getSetting('searchFilters')
      if (savedFilters) {
        const parsedFilters = JSON.parse(savedFilters)
        setFilters((prevFilters) => ({ ...prevFilters, ...parsedFilters }))
      }
    } catch (error) {
      console.error('Failed to load saved search filters:', error)
    }
  }

  const loadFilterOptions = async () => {
    try {
      const [genres, keys, crates] = await Promise.all([
        window.api.mixxx.getAvailableGenres(),
        window.api.mixxx.getAvailableKeys(),
        window.api.mixxx.getAvailableCrates()
      ])

      const bpmOptions = {
        minBpm: Math.floor(mixxxStats.bpmRange.minBpm),
        maxBpm: Math.ceil(mixxxStats.bpmRange.maxBpm)
      }

      setFilterOptions({ genres, keys, crates, ...bpmOptions })
    } catch (error) {
      console.error('Failed to load filter options:', error)
    }
  }

  useEffect(() => {
    window.api.saveSearchFilters(filters)
    handleSearch()
  }, [filters])

  const handleSearch = async () => {
    try {
      setSearching(true)
      const keys = filters.keys.flatMap(key => key.value)
      const crates = filters.crates.map(crate => crate.value)
      const quereyParams = { ...filters, keys, crates }
      const results = await window.api.mixxx.getTracks(quereyParams)
      console.log('Search results:', results)
      setSearchResults(results)
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setSearching(false)
    }
  }

  const handleAddTracks = async () => {
    try {
      const tracksToAdd = Array.from(selectedTracks)
      console.log('Adding tracks to playlist:', tracksToAdd)
      // onTracksAdded(tracksToAdd)
      // onHide()
    } catch (error) {
      console.error('Failed to add tracks:', error)
    }
  }

  return (
    <Modal show={show} onHide={onHide} size="xl" centered onExited={onExited}>
      <Modal.Header closeButton>
        <Modal.Title>Add Tracks to Playlist</Modal.Title>
      </Modal.Header>
      <Modal.Body className="text-center py-5">
        <TrackSearchInput value={filters.query} onChange={(query) => setFilters((prev) => ({ ...prev, query }))} />
        <TrackSearchFilters filters={filters}
                            filterOptions={filterOptions}
                            onChange={(advFilters) => setFilters((prev) => ({ ...prev, ...advFilters }))}
        />
        <div>Search Results Here</div>
        <Button
          variant="primary"
          onClick={handleAddTracks}
          disabled={selectedTracks.size === 0}
        >
          Add Selected Tracks
        </Button>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  )
}
