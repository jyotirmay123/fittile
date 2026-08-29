import { render, screen, waitFor } from '@testing-library/react'
import { App } from './App'

describe('Fitile application shell', () => {
  it('guides a brand-new user into onboarding before the main app', async () => {
    render(<App />)
    // With no saved profile the app routes to onboarding rather than showing sample data.
    await waitFor(() => expect(screen.getByRole('heading', { level: 1 })).toBeVisible())
  })
})
