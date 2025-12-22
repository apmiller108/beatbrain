import PropTypes from 'prop-types'
import { Form, Button } from 'react-bootstrap'
import TrackCountInput from '../filters/TrackCountInput'
import BpmRangeInput from '../filters/BpmRangeInput'
import GenreMultiSelect from '../filters/GenreMultiSelect'
import CrateMultiSelect from '../filters/CrateMultiSelect'
import KeyMultiSelect from '../filters/KeyMultiSelect'

const PlaylistForm = ({
  filters,
  filterOptions,
  trackCount,
  setTrackCount,
  onFiltersChange,
  maxTrackCount,
  onGeneratePlaylist,
  isValid
}) => {
  const { bpmRange, genres, crates, keys } = filterOptions

  const handleFilterChange = (changedFilters) => {
    onFiltersChange({ ...filters, ...changedFilters })
  }

  return (
    <div id="playlist-filters" className="mb-4 p-3 border rounded shadow-sm bg-light">
      <Form>
        <TrackCountInput
          value={trackCount}
          onChange={setTrackCount}
          max={maxTrackCount}
        />
        <BpmRangeInput
          minBpm={bpmRange.minBpm}
          maxBpm={bpmRange.maxBpm}
          minValue={filters.minBpm}
          maxValue={filters.maxBpm}
          onChange={handleFilterChange}
        />
        <GenreMultiSelect
          genres={genres}
          value={filters.genres}
          onChange={(value) => { handleFilterChange({ genres: value }) }}
        />
        <CrateMultiSelect
          crates={crates}
          value={filters.crates}
          onChange={(value) => { handleFilterChange({ crates: value }) }}
        />
        <KeyMultiSelect
          keys={keys}
          value={filters.keys}
          onChange={(value) => { handleFilterChange({ keys: value }) }}
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
