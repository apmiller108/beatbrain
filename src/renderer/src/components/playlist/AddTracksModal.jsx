import { useState, useEffect } from 'react'
import { Modal, Button, Spinner } from 'react-bootstrap'

export default function AddTracksModal({
  show,
  onHide,
  playlistTrackIds = [],
  onTracksAdded
}) {
  const [loading, setLoading] = useState(true)
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

  useEffect(() => {
    loadFilterOptions()
  }, [])

  const loadFilterOptions = async () => {
    try {
      setLoading(true)
      const [genres, keys, crates] = await Promise.all([
        window.api.mixxx.getAvailableGenres(),
        window.api.mixxx.getAvailableKeys(),
        window.api.mixxx.getAvailableCrates()
      ])

      setFilterOptions({ genres, keys, crates })
    } catch (error) {
      console.error('Failed to load filter options:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    try {
      setSearching(true)
      const results = await window.api.getTracks(filters)
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
    <Modal show={show} onHide={onHide} size="xl" centered>
      <Modal.Header closeButton>
        <Modal.Title>Add Tracks to Playlist</Modal.Title>
      </Modal.Header>
      <Modal.Body className="text-center py-5">
        {loading && (
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading search...</span>
          </Spinner>
        )}
        {!loading && (
          <>
            <div>Search Query section here</div>
            <div>Search Filters Here</div>
            <div>Search Results Here</div>
            <Button
              variant="primary"
              onClick={handleAddTracks}
              disabled={selectedTracks.size === 0}
            >
              Add Selected Tracks
            </Button>
          </>
        )}

      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  )
}
