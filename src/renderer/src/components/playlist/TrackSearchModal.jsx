import { useState, useEffect, useContext, useRef } from 'react'
import propTypes from 'prop-types'
import { MixxxStatsContext } from '../../contexts/MixxxStatsContext'
import { Modal, Button } from 'react-bootstrap'
import TrackSearchInput from './TrackSearchInput'
import TrackSearchFilters from './TrackSearchFilters'
import TrackSearchResults from './TrackSearchResults'
import useDebounce from '../../hooks/useDebounced'

const TrackSearchModal = ({
  show,
  onHide,
  onExited,
  playlistTrackIds = [],
  onTracksAdded
}) => {
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
  const [keyNotation, setKeyNotation] = useState('original')

  const mixxxStats = useContext(MixxxStatsContext)
  const debouncedFilters = useDebounce(filters, 300);
  const isInitialMount = useRef(true);

  // Effect for initial loading of all dropdown options and saved user settings
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [genres, keys, crates, savedFiltersStr, keyNotationPref] = await Promise.all([
          window.api.mixxx.getAvailableGenres(),
          window.api.mixxx.getAvailableKeys(),
          window.api.mixxx.getAvailableCrates(),
          window.api.getSetting('searchFilters'),
          window.api.getUserPreference('ui', 'key_notation'),
        ]);

        const bpmOptions = {
          minBpm: Math.floor(mixxxStats.bpmRange.minBpm),
          maxBpm: Math.ceil(mixxxStats.bpmRange.maxBpm)
        };
        setFilterOptions({ genres, keys, crates, ...bpmOptions });
        setKeyNotation(keyNotationPref || 'original');

        if (savedFiltersStr) {
          const savedFilters = JSON.parse(savedFiltersStr);
          setFilters(prev => ({ ...prev, ...savedFilters }));
        }
      } catch (error) {
        console.error('Failed to load initial search data:', error);
      }
    };

    loadInitialData();
  }, []);

  // Effect for handling the search that depends on a debounced value
  useEffect(() => {
    // Prevent search on the very first render cycle
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const handleSearch = async () => {
      try {
        setSearching(true);
        const keys = debouncedFilters.keys.flatMap(key => key.value);
        const crates = debouncedFilters.crates.map(crate => crate.value);
        const queryParams = { ...debouncedFilters, keys, crates };
        const results = await window.api.mixxx.getTracks(queryParams);
        setSearchResults(results);
      } catch (error) {
        console.error('Search failed:', error);
      } finally {
        setSearching(false);
      }
    };

    handleSearch();
    window.api.saveSearchFilters(debouncedFilters)

  }, [debouncedFilters]);

  const handleToggleTrack = (trackId) => {
    const newSelected = new Set(selectedTracks)
    if (newSelected.has(trackId)) {
      newSelected.delete(trackId)
    } else {
      newSelected.add(trackId)
    }
    setSelectedTracks(newSelected)
  }

  const handleToggleAll = () => {
    const eligibleForSelection = searchResults.filter(t => !playlistTrackIds.includes(t.id))

    const allSelected = eligibleForSelection.every(t => selectedTracks.has(t.id))

    if (allSelected) {
      setSelectedTracks(new Set())
    } else {
      setSelectedTracks(new Set(eligibleForSelection.map(t => t.id)))
    }
  }

  const handleAddTracks = async () => {
    try {
      const tracksToAdd = Array.from(selectedTracks).map(id => searchResults.find(t => t.id === id))
      await onTracksAdded(tracksToAdd)
      onHide()
    } catch (error) {
      console.error('Failed to add tracks:', error)
    }
  }

  return (
    <Modal show={show} onHide={onHide} size="xl" centered onExited={onExited}>
      <Modal.Header closeButton>
        <Modal.Title>Add Tracks to Playlist</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <TrackSearchInput value={filters.query} onChange={(query) => setFilters((prev) => ({ ...prev, query }))} />
        <TrackSearchFilters filters={filters}
                            filterOptions={filterOptions}
                            onChange={(advFilters) => setFilters((prev) => ({ ...prev, ...advFilters }))}
        />
        <TrackSearchResults
          results={searchResults}
          selectedTracks={selectedTracks}
          playlistTrackIds={playlistTrackIds}
          onToggleTrack={handleToggleTrack}
          onToggleAll={handleToggleAll}
          searching={searching}
          keyNotation={keyNotation}
        />
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
        <Button
          variant="primary"
          onClick={handleAddTracks}
          disabled={selectedTracks.size === 0}
        >
          Add {selectedTracks.size > 0 && `${selectedTracks.size} `}Selected Tracks
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

TrackSearchModal.propTypes = {
  show: propTypes.bool.isRequired,
  onHide: propTypes.func.isRequired,
  onExited: propTypes.func,
  playlistTrackIds: propTypes.arrayOf(propTypes.number),
  onTracksAdded: propTypes.func.isRequired
}

export default TrackSearchModal
