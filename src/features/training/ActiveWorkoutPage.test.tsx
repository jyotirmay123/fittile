import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ActiveWorkoutPage } from './ActiveWorkoutPage'
import { assembleWorkout } from '../../domain/training/assembleWorkout'
import { DataProvider } from '../../data/DataProvider'

const plan = assembleWorkout({
  split: 'push', durationMinutes: 45,
  capabilities: ['bodyweight', 'dumbbell', 'flat-bench', 'incline-bench', 'seated-bench'],
  excludedExerciseIds: [], readiness: { chest: 94, triceps: 82, 'front-delts': 88, 'side-delts': 91 },
  variability: 'balanced', seed: 'demo-active',
})

describe('ActiveWorkoutPage', () => {
  it('logs a set and starts a rest timer', async () => {
    const user = userEvent.setup()
    render(
      <DataProvider userId={`active-${crypto.randomUUID()}`}>
        <ActiveWorkoutPage plan={plan} sessionId="session-1" title="Dumbbell push" onFinish={() => undefined} />
      </DataProvider>,
    )
    const weight = screen.getByLabelText('Dumbbell bench press: weight for set 1')
    await user.clear(weight)
    await user.type(weight, '12.5')
    await user.click(screen.getByRole('button', { name: 'Complete Dumbbell bench press set 1' }))
    expect(screen.getByRole('timer')).toBeVisible()
    expect(weight).toHaveValue(12.5)
  })
})
