import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import DatabaseConnectionModal from '@renderer/components/DatabaseConnectionModal'

describe('DatabaseConnectionModal', () => {
  const defaultProps = {
    show: true,
    onHide: vi.fn(),
    onConnect: vi.fn(),
    onManualSelect: vi.fn(),
    onDisconnect: vi.fn(),
    mixxxStatus: {
      isConnected: false,
      defaultPathExists: false,
      defaultPath: null,
      dbPath: null,
      lastError: null
    },
    databasePreferences: {},
    loading: false
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('when not connected', () => {
    it('should render connection modal with correct title', () => {
      render(<DatabaseConnectionModal {...defaultProps} />)

      expect(screen.getByText('Connect to Mixxx Database')).toBeInTheDocument()
      expect(screen.getByText(/BeatBrain needs to connect to your Mixxx database/)).toBeInTheDocument()
    })

    it('should show manual selection option when no default path exists', () => {
      render(<DatabaseConnectionModal {...defaultProps} />)

      expect(screen.getByLabelText('Select database file')).toBeInTheDocument()
      expect(screen.queryByText('Use auto-detected database')).not.toBeInTheDocument()
    })

    it('should show both auto-detect and manual options when default path exists', () => {
      const props = {
        ...defaultProps,
        mixxxStatus: {
          ...defaultProps.mixxxStatus,
          defaultPathExists: true,
          defaultPath: '/path/to/mixxxdb.sqlite'
        }
      }

      render(<DatabaseConnectionModal {...props} />)

      const autoRadio = document.querySelector('label[for="auto-detect"]')
      expect(autoRadio).toBeInTheDocument()
      expect(screen.getByLabelText('Select database file')).toBeInTheDocument()
      expect(screen.getByText('/path/to/mixxxdb.sqlite')).toBeInTheDocument()
    })

    it('should enable browse button when manual option is selected', async () => {
      const user = userEvent.setup()
      render(<DatabaseConnectionModal {...defaultProps} />)

      const manualRadio = screen.getByLabelText('Select database file')
      const browseButton = screen.getByText('Browse...')

      expect(manualRadio).toBeChecked() // Should be checked by default when no auto-detect
      expect(browseButton).toBeEnabled()
    })

    it('should call onManualSelect when browse button is clicked', async () => {
      const user = userEvent.setup()
      const mockOnManualSelect = vi.fn().mockResolvedValue('/selected/path.sqlite')

      const props = {
        ...defaultProps,
        onManualSelect: mockOnManualSelect
      }

      render(<DatabaseConnectionModal {...props} />)

      const browseButton = screen.getByText('Browse...')
      await user.click(browseButton)

      expect(mockOnManualSelect).toHaveBeenCalledOnce()
    })

    it('should update manual path when browse returns a path', async () => {
      const user = userEvent.setup()
      const mockOnManualSelect = vi.fn().mockResolvedValue('/selected/path.sqlite')

      const props = {
        ...defaultProps,
        onManualSelect: mockOnManualSelect
      }

      render(<DatabaseConnectionModal {...props} />)

      const browseButton = screen.getByText('Browse...')
      await user.click(browseButton)

      await waitFor(() => {
        const pathInput = screen.getByPlaceholderText('Select mixxxdb.sqlite file...')
        expect(pathInput).toHaveValue('/selected/path.sqlite')
      })
    })

    it('should show error message when lastError is present', () => {
      const props = {
        ...defaultProps,
        mixxxStatus: {
          ...defaultProps.mixxxStatus,
          lastError: 'Database file not found'
        }
      }

      render(<DatabaseConnectionModal {...props} />)

      expect(screen.getByText('Connection Error:')).toBeInTheDocument()
      expect(screen.getByText('Database file not found')).toBeInTheDocument()
    })

    it('should handle remember choice checkbox', async () => {
      const user = userEvent.setup()
      render(<DatabaseConnectionModal {...defaultProps} />)

      const checkbox = screen.getByLabelText(/Remember my choice/)
      expect(checkbox).not.toBeChecked()

      await user.click(checkbox)
      expect(checkbox).toBeChecked()
    })

    it('should call onConnect with correct parameters when connect button is clicked', async () => {
      const user = userEvent.setup()
      const mockOnConnect = vi.fn().mockResolvedValue(true)

      const props = {
        ...defaultProps,
        onConnect: mockOnConnect,
        mixxxStatus: {
          ...defaultProps.mixxxStatus,
          defaultPathExists: true,
          defaultPath: '/auto/path.sqlite'
        }
      }

      render(<DatabaseConnectionModal {...props} />)

      // Select auto-detect option
      const autoRadio = document.querySelector('label[for="auto-detect"]')
      await user.click(autoRadio)

      // Check remember choice
      const rememberCheckbox = screen.getByLabelText(/Remember my choice/)
      await user.click(rememberCheckbox)

      // Click connect
      const connectButton = screen.getByText('Connect')
      await user.click(connectButton)

      expect(mockOnConnect).toHaveBeenCalledWith(null, true)
    })

    it('should disable connect button when manual path is empty', () => {
      render(<DatabaseConnectionModal {...defaultProps} />)

      const connectButton = screen.getByText('Connect')
      expect(connectButton).toBeDisabled()
    })

    it('should show loading state when loading is true', () => {
      const props = {
        ...defaultProps,
        loading: true
      }

      render(<DatabaseConnectionModal {...props} />)

      expect(screen.getByText('Connecting...')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /connecting/i })).toBeDisabled()
    })
  })

  describe('when connected', () => {
    const connectedProps = {
      ...defaultProps,
      mixxxStatus: {
        ...defaultProps.mixxxStatus,
        isConnected: true,
        dbPath: '/connected/path.sqlite'
      }
    }

    it('should show connected state with database path', () => {
      render(<DatabaseConnectionModal {...connectedProps} />)

      expect(screen.getByText('Mixxx Database')).toBeInTheDocument()
      expect(screen.getByText(/BeatBrain is currently connected/)).toBeInTheDocument()
      expect(screen.getByText('/connected/path.sqlite')).toBeInTheDocument()
    })

    it('should show disconnect button instead of connect button', () => {
      render(<DatabaseConnectionModal {...connectedProps} />)

      expect(screen.getByText('Disconnect')).toBeInTheDocument()
      expect(screen.queryByText('Connect')).not.toBeInTheDocument()
    })

    it('should call onDisconnect when disconnect button is clicked', async () => {
      const user = userEvent.setup()
      const mockOnDisconnect = vi.fn()

      const props = {
        ...connectedProps,
        onDisconnect: mockOnDisconnect
      }

      render(<DatabaseConnectionModal {...props} />)

      const disconnectButton = screen.getByText('Disconnect')
      await user.click(disconnectButton)

      expect(mockOnDisconnect).toHaveBeenCalledOnce()
    })
  })

  describe('modal behavior', () => {
    it('should call onHide when cancel/skip button is clicked', async () => {
      const user = userEvent.setup()
      const mockOnHide = vi.fn()

      const props = {
        ...defaultProps,
        onHide: mockOnHide
      }

      render(<DatabaseConnectionModal {...props} />)

      const skipButton = screen.getByText('Skip for now')
      await user.click(skipButton)

      expect(mockOnHide).toHaveBeenCalledOnce()
    })

    it('should not render when show is false', () => {
      const props = {
        ...defaultProps,
        show: false
      }

      render(<DatabaseConnectionModal {...props} />)

      expect(screen.queryByText('Connect to Mixxx Database')).not.toBeInTheDocument()
    })
  })
})
