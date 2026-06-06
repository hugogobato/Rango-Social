import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { OnboardingScreen } from './OnboardingScreen'
import { Providers } from '../../app/providers'

// Mock navigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe('OnboardingScreen', () => {
  it('renders welcome screen step first', () => {
    render(
      <MemoryRouter>
        <Providers>
          <OnboardingScreen />
        </Providers>
      </MemoryRouter>
    )

    expect(screen.getByText('Bem-vindo ao Rango Social 👋')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /bora começar/i })).toBeInTheDocument()
  })

  it('can navigate through steps and validate CPF', async () => {
    render(
      <MemoryRouter>
        <Providers>
          <OnboardingScreen />
        </Providers>
      </MemoryRouter>
    )

    // Step 0 -> Step 1 (Style)
    fireEvent.click(screen.getByRole('button', { name: /bora começar/i }))
    await waitFor(() => {
      expect(screen.getByText('Escolhe seu estilo')).toBeInTheDocument()
    })

    // Select style and proceed to Step 2 (City)
    fireEvent.click(screen.getByText('🍔 Sou do bonde'))
    fireEvent.click(screen.getByRole('button', { name: /próximo/i }))
    await waitFor(() => {
      expect(screen.getByText('Escolhe sua cidade')).toBeInTheDocument()
    })

    // Proceed to Step 3 (CPF)
    fireEvent.click(screen.getByRole('button', { name: /próximo/i }))
    await waitFor(() => {
      expect(screen.getByText('Sem bot por aqui! 🤖')).toBeInTheDocument()
    })

    // Verify invalid CPF is blocked (e.g. typing something short or mock invalid)
    const input = screen.getByPlaceholderText('000.000.000-00')
    fireEvent.change(input, { target: { value: '111.111.111-11' } }) // invalid CPF pattern
    fireEvent.click(screen.getByRole('button', { name: /confirmar/i }))
    // Should stay on CPF step since it is invalid
    expect(screen.getByText('Sem bot por aqui! 🤖')).toBeInTheDocument()

    // Enter valid CPF and confirm -> Step 4 (Follow)
    // A valid CPF checksum: 123.456.789-09
    fireEvent.change(input, { target: { value: '123.456.789-09' } })
    fireEvent.click(screen.getByRole('button', { name: /confirmar/i }))
    await waitFor(() => {
      expect(screen.getByText('Segue uns crias')).toBeInTheDocument()
    })

    // Proceed to Step 5 (Done)
    fireEvent.click(screen.getByRole('button', { name: /falta pouco/i }))
    await waitFor(() => {
      expect(screen.getByText('Boca livre tá liberada! 🚀')).toBeInTheDocument()
    })

    // Finish onboarding and verify redirection and storage update
    fireEvent.click(screen.getByRole('button', { name: /bora explorar/i }))
    await waitFor(() => {
      expect(localStorage.getItem('hasCompletedOnboarding')).toBe('true')
      expect(mockNavigate).toHaveBeenCalledWith('/')
    })
  })
})
