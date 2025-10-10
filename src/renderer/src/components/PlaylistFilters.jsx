import PropTypes from 'prop-types'
import { Form } from 'react-bootstrap'
import TrackCountInput from './filters/TrackCountInput'
import BpmRangeInput from './filters/BpmRangeInput'
import GenreMultiSelect from './filters/GenreMultiSelect'

const PlaylistFilters = ({
  filters,
  onFiltersChange,
  maxTrackCount,
  bpmRange,
  availableGenres
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
      </Form>
    </div>
  )
}

PlaylistFilters.propTypes = {
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
}

export default PlaylistFilters
