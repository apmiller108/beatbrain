/**
 * Generates Extended M3U format content from playlist tracks
 * @param {Array} tracks - Array of track objects with metadata
 * @param {string} playlistName - Name of the playlist for header comment
 * @returns {string} M3U file content
 */
export const generateM3UContent = (tracks, playlistName) => {
  if (!Array.isArray(tracks) || tracks.length === 0) {
    throw new Error('Tracks array is required and must not be empty');
  }

  const lines = [];

  // M3U header
  lines.push('#EXTM3U');
  lines.push(`# Playlist: ${playlistName}`);
  lines.push(`# Generated: ${new Date().toISOString()}`);
  lines.push(`# Tracks: ${tracks.length}`);
  lines.push('');

  // Add each track with extended metadata
  tracks.forEach((track) => {
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
