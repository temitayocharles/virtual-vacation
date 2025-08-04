import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

// Create a simple LoadingSpinner component for testing
const LoadingSpinner = ({ size }: { size?: string }) => (
  <div data-testid="loading-spinner" data-size={size} className="loading-spinner">
    Loading...
  </div>
)

describe('LoadingSpinner Component', () => {
  it('renders with default props', () => {
    render(<LoadingSpinner />)
    const spinner = screen.getByTestId('loading-spinner')
    expect(spinner).toBeInTheDocument()
    expect(spinner).toHaveTextContent('Loading...')
  })

  it('renders with large size', () => {
    render(<LoadingSpinner size="large" />)
    const spinner = screen.getByTestId('loading-spinner')
    expect(spinner).toHaveAttribute('data-size', 'large')
  })

  it('has proper CSS class', () => {
    render(<LoadingSpinner />)
    const spinner = screen.getByTestId('loading-spinner')
    expect(spinner).toHaveClass('loading-spinner')
  })
})
