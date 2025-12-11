/**
 * Generates Extended M3U format content from playlist tracks
 * @param {Object} playlist - Playlist object containing name and tracks
 * @returns {string} M3U file content
 */
export const generateM3UContent = (playlist) => {
  if (playlist.tracks.length === 0) {
    throw new Error('Tracks array is required and must not be empty');
  }

  const lines = [];

  // M3U header
  lines.push('#EXTM3U');
  lines.push(`# Playlist: ${playlist.name}`);
  lines.push(`# Generated: ${new Date().toISOString()}`);
  lines.push(`# Tracks: ${playlist.tracks.length}`);
  lines.push('');

  // Add each track with extended metadata
  playlist.tracks.forEach((track) => {
    const duration = Math.round(track.duration || 0);
    const artist = track.artist || 'Unknown Artist';
    const title = track.title || 'Unknown Title';

    // EXTINF format: #EXTINF:<duration>,<artist> - <title>
    lines.push(`#EXTINF:${duration},${artist} - ${title}`);

    lines.push(track.file_path);
    lines.push('');
  });

  return lines.join('\n');
}

export default generateM3UContent
