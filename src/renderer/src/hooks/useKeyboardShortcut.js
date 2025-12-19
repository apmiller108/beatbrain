import { useEffect } from 'react'

/**
 * Hook to register keyboard shortcuts
 * @param {string} key - The key to listen for (e.g., 'f', 'Escape')
 * @param {Function} callback - Function to call when shortcut is triggered
 * @param {Object} options - Modifier keys (ctrl, meta, shift, alt)
 */
export default function useKeyboardShortcut(key, callback, options = {}) {
  switch (options.modifierKey) {
    case 'Ctrl':
      options.ctrl = true
      break
    case 'Meta':
      options.meta = true
      break
    default:
      break
  }

  const { ctrl = false, meta = false, shift = false, alt = false, enabled = true } = options

  useEffect(() => {
    if (!enabled) return

    const handleKeyDown = (event) => {
      const ctrlMatch = ctrl && event.ctrlKey || !ctrl && !event.ctrlKey
      const shiftMatch = shift && event.shiftKey || !shift && !event.shiftKey
      const metaMatch = meta && event.metaKey || !meta && !event.metaKey
      const altMatch = alt && event.altKey || !alt && !event.altKey

      // Check if key matches (case-insensitive)
      const keyMatch = event.key.toLowerCase() === key.toLowerCase()

      if (keyMatch && ctrlMatch && shiftMatch && altMatch && metaMatch) {
        event.preventDefault()
        callback(event)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [key, callback, ctrl, meta, shift, alt, enabled])
}
