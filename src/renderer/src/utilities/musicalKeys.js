const traditionalToCamelotMap = {
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

const camelotToTraditionalMap = {
  '1A': 'G#m', '1B': 'B', '2A': 'D#m', '2B': 'F#', '3A': 'A#m', '3B': 'C#',
  '4A': 'Fm', '4B': 'G#', '5A': 'Cm', '5B': 'D#', '6A': 'Gm', '6B': 'A#',
  '7A': 'Dm', '7B': 'F', '8A': 'Am', '8B': 'C', '9A': 'Em', '9B': 'G',
  '10A': 'Bm', '10B': 'D', '11A': 'F#m', '11B': 'A', '12A': 'C#m', '12B': 'E'
}

export const toCamelot = (key) => {
  if (!key) return key

  // If key already contains Camelot notation (has A or B followed by space and parenthesis)
  if (key.includes('A (') || key.includes('B (')) {
    return key.split(' ')[0]
  }

  return traditionalToCamelotMap[key] || key
}

export const toTraditional = (key) => {
  const camelotKey = toCamelot(key) // First convert to Camelot to standardize
  return camelotToTraditionalMap[camelotKey] // Then convert to normalized Traditional
}

export default {
  toCamelot,
  toTraditional
}
