import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import App from './App'

// Mock the Zustand store
vi.mock('./store/vacationStore', () => ({
  useVacationStore: () => ({
    isLoading: false
  })
}))

// Mock lazy-loaded components
vi.mock('./pages/HomePage', () => ({
  default: () => <div data-testid="home-page">Home Page</div>
}))

vi.mock('./components/Navigation/Navigation', () => ({
  default: () => <nav data-testid="navigation">Navigation</nav>
}))

vi.mock('./components/UI/LoadingSpinner', () => ({
  default: ({ size }: { size?: string }) => (
    <div data-testid="loading-spinner" data-size={size}>Loading...</div>
  )
}))

const AppWithProviders = () => (
  <BrowserRouter>
    <App />
  </BrowserRouter>
)

describe('App Component', () => {
  it('renders without crashing', () => {
    render(<AppWithProviders />)
    expect(screen.getByTestId('navigation')).toBeInTheDocument()
  })

  it('renders navigation component', () => {
    render(<AppWithProviders />)
    const navigation = screen.getByTestId('navigation')
    expect(navigation).toBeInTheDocument()
  })

  it('has proper app structure', () => {
    const { container } = render(<AppWithProviders />)
    expect(container.firstChild).toHaveClass('min-h-screen')
  })
})
