import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RecoveryPage } from './RecoveryPage'
import { DataProvider } from '../../data/DataProvider'
import { FitileDb } from '../../data/local/FitileDb'
import { createFitileRepository } from '../../data/local/repositories'

describe('RecoveryPage', () => {
  it('shows which recent training reduced a muscle’s readiness', async () => {
    const userId = `rec-${crypto.randomUUID()}`
    const repository = createFitileRepository(new FitileDb(), userId)
    await repository.recoveryEvents.put({
      id: crypto.randomUUID(), muscleId: 'chest', fatigue: 72,
      occurredAt: new Date(Date.now() - 3_600_000).toISOString(), recoveryHours: 72,
      sourceLabel: 'Dumbbell push session',
    })

    const user = userEvent.setup()
    render(<DataProvider userId={userId}><RecoveryPage /></DataProvider>)

    await user.click(await screen.findByRole('button', { name: /chest —/i }))
    expect(await screen.findByText(/dumbbell push session/i)).toBeVisible()
  })
})
