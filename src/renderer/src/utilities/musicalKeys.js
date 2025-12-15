export const keyMap = {
    'Am': '8A', 'E': '12B', 'B': '1B', 'F#': '2B', 'C#': '3B', 'G#': '4B',
    'D#': '5B', 'A#': '6B', 'F': '7B', 'C': '8B', 'G': '9B', 'D': '10B',
    'A': '11B', 'Em': '9A', 'Bm': '10A', 'F#m': '11A', 'C#m': '12A',
    'G#m': '1A', 'D#m': '2A', 'A#m': '3A', 'Fm': '4A', 'Cm': '5A',
    'Gm': '6A', 'Dm': '7A', 'Amin': '8A', 'Emaj': '12B', 'Bmaj': '1B',
    'F#maj': '2B', 'C#maj': '3B', 'G#maj': '4B', 'D#maj': '5B', 'A#maj': '6B',
    'Fmaj': '7B', 'Cmaj': '8B', 'Gmaj': '9B', 'Dmaj': '10B', 'Amaj': '11B',
    'Emin': '9A', 'Bmin': '10A', 'F#min': '11A', 'C#min': '12A', 'G#min': '1A',
    'D#min': '2A', 'A#min': '3A', 'Fmin': '4A', 'Cmin': '5A', 'Gmin': '6A',
    'Dmin': '7A', 'Gbm': '11A', 'Dbm': '12A', 'Abm': '1A', 'Ebm': '2A',
    'Bbm': '3A', 'Gbmin': '11A', 'Dbmin': '12A', 'Abmin': '1A', 'Ebmin': '2A',
    'Bbmin': '3A', 'BM': '1B', 'F#M': '2B', 'C#M': '3B', 'G#M': '4B',
    'D#M': '5B', 'A#M': '6B', 'FM': '7B', 'CM': '8B', 'GM': '9B',
    'DM': '10B', 'AM': '11B', 'Cb': '1B', 'Gb': '2B', 'Db': '3B',
    'Ab': '4B', 'Eb': '5B', 'Bb': '6B', 'Cbmaj': '1B', 'Gbmaj': '2B',
    'Dbmaj': '3B', 'Abmaj': '4B', 'Ebmaj': '5B', 'Bbmaj': '6B'
}

export const toCamelot = (key) => {
  if (!key) return key

  // If key already contains Camelot notation (has A or B followed by space and parenthesis)
  if (key.includes('A (') || key.includes('B (')) {
    return key.split(' ')[0]
  }

  return keyMap[key] || key
}

export const toTraditional = (key) => {
  let traditionalKey;

  // Extract camelot part if the original notation contains both notations or its just a Camelot key
  // e.g., "8A (Am)" -> "8A"
  const camelotKey = (key.match(/[0-9]{1,2}[AB]/) || [])[0]

  // If this is a Camelot key, find the corresponding traditional key. Otherwise, use the original key.
  if (camelotKey) {
    let entry = Object.entries(keyMap).find(([traditional, camelot]) => camelot === camelotKey)
    traditionalKey = entry[0]
  } else {
    traditionalKey = key
  }

  // Handle multiple traditional keys mapping to the same Camelot key by
  // normalizing the traditional key: Convert maj to M and min to m for
  // consistency. E.g., "Amin" -> "Am", "Cmaj" -> "CM". For example 8A will
  // always map to "Am" instead of sometimes "Amin".
  if (traditionalKey.endsWith('min')) {
    return traditionalKey.slice(0, -3) + 'm'
  } else if (traditionalKey.endsWith('maj')) {
    return traditionalKey.slice(0, -3) + 'M'
  } else {
    return traditionalKey
  }
}

export default {
  toCamelot,
  toTraditional,
  keyMap
}
