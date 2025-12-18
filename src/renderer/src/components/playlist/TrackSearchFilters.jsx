import { useState } from 'react'
import { Collapse, Button, Row, Col } from 'react-bootstrap'
import propTypes from 'prop-types'
import { ChevronDown, ChevronUp } from 'react-bootstrap-icons'
import BpmRangeInput from '../filters/BpmRangeInput'
import GenreMultiSelect from '../filters/GenreMultiSelect'
import KeyMultiSelect from '../filters/KeyMultiSelect'
import CrateMultiSelect from '../filters/CrateMultiSelect'

const TrackSearchFilters = ({
  filters,
  filterOptions,
  onChange,
}) => {
  const [expanded, setExpanded] = useState(false)

  const handleFilterChange = (newFilters) => {
    onChange({ ...filters, ...newFilters })
  }

  return (
    <div className="mb-3">
      <Button
        variant="link"
        onClick={() => setExpanded(!expanded)}
        className="p-0 text-decoration-none d-flex align-items-center gap-2"
      >
        {expanded ? <ChevronUp /> : <ChevronDown />}
        <span>Search Filters</span>
      </Button>

      <Collapse in={expanded}>
        <div className="border rounded p-3 mt-2">
          <Row className="g-3">
            <Col md={6}>
              <BpmRangeInput
                minBpm={filterOptions.minBpm}
                maxBpm={filterOptions.maxBpm}
                minValue={filters.minBpm}
                maxValue={filters.maxBpm}
                onChange={handleFilterChange}
              />
            </Col>
            <Col md={6}>
              <KeyMultiSelect
                value={filters.keys}
                keys={filterOptions.keys}
                onChange={(keys) => {
                  handleFilterChange({ keys })
                }}
              />
            </Col>
            <Col md={6}>
              <GenreMultiSelect
                value={filters.genres}
                genres={filterOptions.genres}
                onChange={(genres) => {
                  handleFilterChange({ genres })
                }}
              />
            </Col>
            <Col md={6}>
              <CrateMultiSelect
                value={filters.crates}
                crates={filterOptions.crates}
                onChange={(crates) => {
                  handleFilterChange({ crates })
                }}
              />
            </Col>
          </Row>
        </div>
      </Collapse>
    </div>
  )
}

TrackSearchFilters.propTypes = {
  filters: propTypes.object.isRequired,
  filterOptions: propTypes.object.isRequired,
  onChange: propTypes.func.isRequired,
}

export default TrackSearchFilters
