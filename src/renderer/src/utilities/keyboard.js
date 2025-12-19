export const getModifierKey = (platform) => {
  console.log('Determining modifier key for platform:', platform)
  switch (platform) {
    case 'win32':
      return 'Ctrl'
    case 'darwin':
      return 'Cmd'
    case 'linux':
      return 'Ctrl'
    default:
      return 'Ctrl'
  }
}

export default {
  getModifierKey
}
