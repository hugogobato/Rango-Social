import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import App from './App'

describe('App', () => {
  it('renders app title', () => {
    render(<App />)
    expect(screen.getByText('Rango Social')).toBeInTheDocument()
  })

  it('increments counter on button click', () => {
    render(<App />)
    const button = screen.getByRole('button', { name: /contador/i })
    expect(button).toHaveTextContent('Contador: 0')
    fireEvent.click(button)
    expect(button).toHaveTextContent('Contador: 1')
  })
})
