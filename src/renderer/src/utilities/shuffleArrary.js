// Fisher - Yates shuffle algorithm
// In - place array shuffling. Modifies the original array, so yeah.
export const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1)) // Random index from 0 to i

    const itemI = array[i]
    const itemJ = array[j]

    array[i] = itemJ
    array[j] = itemI
  }
  return array
}
