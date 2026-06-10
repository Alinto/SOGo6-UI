import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import TaskProgressBar from '../task-progress-bar'

describe('TaskProgressBar', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('basic rendering', () => {
    it('renders progress bar container', () => {
      render(<TaskProgressBar value={50} />)
      expect(screen.getByTestId('task-progress-bar')).toBeInTheDocument()
    })

    it('renders percentage label by default', () => {
      render(<TaskProgressBar value={50} />)
      expect(screen.getByText('50%')).toBeInTheDocument()
    })

    it('hides label when showLabel is false', () => {
      render(<TaskProgressBar value={50} showLabel={false} />)
      expect(screen.queryByText('50%')).not.toBeInTheDocument()
    })
  })

  describe('configuration', () => {
    it('clamps value below 0 to 0%', () => {
      render(<TaskProgressBar value={-10} />)
      expect(screen.getByText('0%')).toBeInTheDocument()
    })

    it('clamps value above 100 to 100%', () => {
      render(<TaskProgressBar value={150} />)
      expect(screen.getByText('100%')).toBeInTheDocument()
    })
  })

  describe('custom styling', () => {
    it('applies custom className to container', () => {
      render(<TaskProgressBar value={25} className="custom-class" />)
      expect(screen.getByTestId('task-progress-bar')).toHaveClass('custom-class')
    })

    it('sets fill width from value', () => {
      const { container } = render(<TaskProgressBar value={75} />)
      const fill = container.querySelector('[style*="width"]')
      expect(fill).toHaveStyle({ width: '75%' })
    })

    it('uses shared track and fill classes', () => {
      const { container } = render(<TaskProgressBar value={40} />)
      expect(container.querySelector('.bg-primary\\/20')).toBeInTheDocument()
      expect(container.querySelector('.bg-primary')).toBeInTheDocument()
    })
  })

  describe('component stability', () => {
    it('renders consistently across re-renders', () => {
      const { rerender } = render(<TaskProgressBar value={30} />)
      expect(screen.getByText('30%')).toBeInTheDocument()
      rerender(<TaskProgressBar value={60} />)
      expect(screen.getByText('60%')).toBeInTheDocument()
    })
  })
})
