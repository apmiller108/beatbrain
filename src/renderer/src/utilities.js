export const formatDuration = seconds => {
  if (!seconds) return 'N/A'
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)

  if (hours === 0 && minutes === 0) {
    return `${seconds}s`
  }

  if (hours === 0) {
    const secRemainder = Math.floor(seconds % 60)
    return `${minutes}m ${secRemainder}s`
  }

  return `${hours}h ${minutes}m`
}

export default { formatDuration }
