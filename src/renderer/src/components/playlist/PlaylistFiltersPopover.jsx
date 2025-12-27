import { Button, Popover, Badge, Stack } from 'react-bootstrap'
import { InfoCircle } from 'react-bootstrap-icons'
import OverlayTrigger from 'react-bootstrap/OverlayTrigger'
import propTypes from 'prop-types'
import { camelCaseToTitleCase } from '../../utilities/formatString'

const PlaylistFiltersPopover = ({ filters, className = '' }) => {

  if (!filters) {
    return null
  }

  let parsedFilters = filters
  try {
    parsedFilters = JSON.parse(filters)
  } catch (error) {
    console.error('Failed to parse filters:', error)
    return null
  }

  const renderFilterValue = (key, value) => {
    // Handle list filter values (eg genres, artists, keys)
    if (Array.isArray(value)) {
      return value.map(item => {
        const itemValue = typeof item === 'object' && item !== null && 'label' in item ? item.label : item
        return (
          <Badge key={`${key}-${itemValue}`} bg="light" text="dark" className="me-2 mb-2">
            {itemValue}
          </Badge>
        )
      })
    }

    // Handle simple values (strings, numbers, booleans)
    return (
      <Badge bg="light" text="dark">
        {String(value || 'none')}
      </Badge>
    )
  }

  const popover = (
    <Popover id="playlist-filters-popover" className="shadow-lg">
      <Popover.Header as="h6" className="bg-light">
        Playlist Filters
      </Popover.Header>
      <Popover.Body className="p-3">
        <Stack gap={3}>
          {Object.entries(parsedFilters).map(([key, value]) => {
            const rendered = renderFilterValue(key, value)
            const label = camelCaseToTitleCase(key)

            return (
              <div key={key}>
                <strong className="d-block mb-2">{label}</strong>
                <div className="ms-2">
                  {rendered.length ? rendered : <span className="text-muted">none</span>}
                </div>
              </div>
            )
          })}
        </Stack>
      </Popover.Body>
    </Popover>
  )

  return (
    <OverlayTrigger
      trigger="click"
      placement="bottom"
      overlay={popover}
      rootClose
    >
      <Button
        variant="outline-secondary"
        size="sm"
        className={`d-flex align-items-center gap-2 ${className}`}
        title="View playlist creation filters"
      >
        <InfoCircle size={18} />
      </Button>
    </OverlayTrigger>
  )
}

PlaylistFiltersPopover.propTypes = {
  filters: propTypes.oneOfType([propTypes.string, propTypes.object])
}

export default PlaylistFiltersPopover
