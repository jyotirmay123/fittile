import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { OnboardingPage } from './OnboardingPage'
import { DataProvider } from '../../data/DataProvider'
import { AuthProvider } from '../auth/AuthProvider'

const renderOnboarding = () =>
  render(
    <MemoryRouter>
      <AuthProvider>
        <DataProvider userId={`onboard-${crypto.randomUUID()}`}>
          <OnboardingPage />
        </DataProvider>
      </AuthProvider>
    </MemoryRouter>,
  )

describe('OnboardingPage', () => {
  it('collects a goal and preferred workout split through a resumable wizard', async () => {
    const user = userEvent.setup()
    renderOnboarding()

    await user.click(screen.getByRole('button', { name: 'Lose fat' }))
    await user.click(screen.getByRole('button', { name: 'Continue' }))
    await user.click(screen.getByRole('button', { name: 'Push / Pull / Legs' }))
    await user.click(screen.getByRole('button', { name: 'Continue' }))
    expect(screen.getByText(/adjustable dumbbells/i)).toBeVisible()
  })
})
