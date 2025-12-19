import { useState } from 'react'
import propTypes from 'prop-types'
import { Form, Spinner } from 'react-bootstrap'
import TrackSearchResultItem from './TrackSearchResultItem'

const TrackSearchResults = ({
  results,
  selectedTracks,
  playlistTrackIds,
  onToggleTrack,
  onToggleAll,
  searching
}) => {

  const allSelected = results.length > 0 &&
    results.every(t => selectedTracks.has(t.id) || playlistTrackIds.includes(t.id))

  return (
    <>
      <div className="border rounded">
        {searching && (
          <div className="text-center py-5">
            <Spinner animation="border" size="sm" />
            <div className="mt-2 text-muted">Searching...</div>
          </div>
        )}

        {!searching && results.length === 0 && (
          <div className="text-center py-5 text-muted">
            No tracks found. Try adjusting your search criteria.
          </div>
        )}

        {!searching && results.length > 0 && (
          <>
            <div className="p-2 border-bottom bg-light d-flex align-items-center gap-2">
              <Form.Check
                type="checkbox"
                checked={allSelected}
                onChange={onToggleAll}
                label={`Select All (${results.length} tracks)`}
              />
            </div>

            <div className="overflow-y-scroll py-2" style={{ maxHeight: '300px' }}>
              {results.map((track) => (
                <TrackSearchResultItem
                  key={track.id}
                  track={track}
                  isSelected={selectedTracks.has(track.id)}
                  isInPlaylist={playlistTrackIds.includes(track.id)}
                  onToggle={onToggleTrack}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </>
  )
}

TrackSearchResults.propTypes = {
  results: propTypes.arrayOf(
    propTypes.shape({
      id: propTypes.number.isRequired,
      title: propTypes.string.isRequired,
      artist: propTypes.string,
      album: propTypes.string,
      duration: propTypes.number,
    })
  ).isRequired,
  selectedTracks: propTypes.instanceOf(Set).isRequired,
  playlistTrackIds: propTypes.arrayOf(propTypes.number).isRequired,
  onToggleTrack: propTypes.func.isRequired,
  onToggleAll: propTypes.func.isRequired,
  searching: propTypes.bool.isRequired,
}

export default TrackSearchResults
