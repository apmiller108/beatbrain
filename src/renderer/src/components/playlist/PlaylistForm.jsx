import PropTypes from 'prop-types'
import { Form, Button, Row, Col } from 'react-bootstrap'
import TrackCountInput from '../filters/TrackCountInput'
import BpmRangeInput from '../filters/BpmRangeInput'
import GenreMultiSelect from '../filters/GenreMultiSelect'
import CrateMultiSelect from '../filters/CrateMultiSelect'
import GroupingMultiSelect from '../filters/GroupingMultiSelect'
import ArtistMultiSelect from '../filters/ArtistMultiSelect'
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
  const { bpmRange, genres, crates, keys, groupings, artists } = filterOptions

  const handleFilterChange = (changedFilters) => {
    onFiltersChange({ ...filters, ...changedFilters })
  }

  return (
    <div id="playlist-filters" className="mb-4 p-3 border rounded shadow-sm bg-light">
      <Form>
        <Row>
          <Col xs={6}>
            <TrackCountInput
              value={trackCount}
              onChange={setTrackCount}
              max={maxTrackCount}
            />
          </Col>
          <Col xs={6}>
            <BpmRangeInput
              minBpm={bpmRange.minBpm}
              maxBpm={bpmRange.maxBpm}
              minValue={filters.minBpm}
              maxValue={filters.maxBpm}
              onChange={handleFilterChange}
            />
          </Col>
        </Row>
        <Row>
          <Col xs={6}>
            <GenreMultiSelect
              genres={genres}
              value={filters.genres}
              onChange={(value) => { handleFilterChange({ genres: value }) }}
            />
          </Col>
          <Col xs={6}>
            <CrateMultiSelect
              crates={crates}
              value={filters.crates}
              onChange={(value) => { handleFilterChange({ crates: value }) }}
            />
          </Col>
        </Row>
        <Row>
          <Col xs={6}>
            <ArtistMultiSelect
              artists={artists}
              value={filters.artists}
              onChange={(value) => { handleFilterChange({ artists: value }) }}
            />
          </Col>
          <Col xs={6}>
            <GroupingMultiSelect
              groupings={groupings}
              value={filters.groupings}
              onChange={(value) => { handleFilterChange({ groupings: value }) }}
            />
          </Col>
        </Row>
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
    minBpm: PropTypes.number,
    maxBpm: PropTypes.number,
    genres: PropTypes.arrayOf(PropTypes.string).isRequired,
    artists: PropTypes.arrayOf(PropTypes.string).isRequired,
    crates: PropTypes.arrayOf(PropTypes.string).isRequired,
    keys: PropTypes.arrayOf(PropTypes.string).isRequired,
    groupings: PropTypes.arrayOf(PropTypes.string).isRequired,
  }).isRequired,
  filterOptions: PropTypes.shape({
    bpmRange: PropTypes.shape({
      minBpm: PropTypes.number,
      maxBpm: PropTypes.number,
    }),
    genres: PropTypes.arrayOf(PropTypes.string),
    artists: PropTypes.arrayOf(PropTypes.string),
    crates: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number,
        name: PropTypes.string,
      })
    ),
    keys: PropTypes.arrayOf(PropTypes.string),
    groupings: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
  trackCount: PropTypes.number.isRequired,
  setTrackCount: PropTypes.func.isRequired,
  onFiltersChange: PropTypes.func.isRequired,
  maxTrackCount: PropTypes.number.isRequired,
  onGeneratePlaylist: PropTypes.func.isRequired,
  isValid: PropTypes.bool.isRequired,
}

export default PlaylistForm
