import PropTypes from 'prop-types'
import { Form, Button } from 'react-bootstrap'
import TrackCountInput from './filters/TrackCountInput'
import BpmRangeInput from './filters/BpmRangeInput'
import GenreMultiSelect from './filters/GenreMultiSelect'
import CrateMultiSelect from './filters/CrateMultiSelect'
import KeyMultiSelect from './filters/KeyMultiSelect'

const PlaylistForm = ({
  filters,
  onFiltersChange,
  maxTrackCount,
  bpmRange,
  availableGenres,
  availableCrates,
  availableKeys,
  onGeneratePlaylist,
  isValid
}) => {
  const handleTrackCountChange = (value) => {
    onFiltersChange({ ...filters, trackCount: value })
  }

  const handleBpmRangeChange = (value) => {
    onFiltersChange({ ...filters, ...value })
  }

  const handleGenresChange = (value) => {
    onFiltersChange({ ...filters, genres: value })
  }

  const handleKeysChange = (value) => {
    onFiltersChange({ ...filters, keys: value })
  }

  const handleCratesChange = (value) => {
    onFiltersChange({ ...filters, crates: value })
  }

  return (
    <div id="playlist-filters" className="mb-4 p-3 border rounded shadow-sm bg-light">
      <Form>
        <TrackCountInput
          value={filters.trackCount}
          onChange={handleTrackCountChange}
          max={maxTrackCount}
        />
        <BpmRangeInput
          minBpm={bpmRange.minBpm}
          maxBpm={bpmRange.maxBpm}
          minValue={filters.minBpm}
          maxValue={filters.maxBpm}
          onChange={handleBpmRangeChange}
        />
        <GenreMultiSelect
          genres={availableGenres}
          value={filters.genres}
          onChange={handleGenresChange}
        />
        <CrateMultiSelect
          crates={availableCrates}
          value={filters.crates}
          onChange={handleCratesChange}
        />
        <KeyMultiSelect
          keys={availableKeys}
          value={filters.keys}
          onChange={handleKeysChange}
        />
        <Button variant="primary"
                disabled={!isValid}
                onClick={onGeneratePlaylist}
        >
          Generate Playlist
        </Button>
      </Form>
    </div>
  )
}

PlaylistForm.propTypes = {
  filters: PropTypes.shape({
    trackCount: PropTypes.number.isRequired,
    minBpm: PropTypes.number,
    maxBpm: PropTypes.number,
    genres: PropTypes.arrayOf(PropTypes.string).isRequired,
  }).isRequired,
  onFiltersChange: PropTypes.func.isRequired,
  maxTrackCount: PropTypes.number.isRequired,
  bpmRange: PropTypes.shape({
    minBpm: PropTypes.number.isRequired,
    maxBpm: PropTypes.number.isRequired,
  }).isRequired,
  availableGenres: PropTypes.arrayOf(PropTypes.string).isRequired,
  disabled: PropTypes.bool,
  onGeneratePlaylist: PropTypes.func.isRequired,
  isValid: PropTypes.bool.isRequired,
}

export default PlaylistForm
