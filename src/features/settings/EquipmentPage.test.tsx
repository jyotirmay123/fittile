import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { EquipmentPage } from './EquipmentPage'
import { DataProvider } from '../../data/DataProvider'
import { FitileDb } from '../../data/local/FitileDb'
import { createFitileRepository } from '../../data/local/repositories'

describe('EquipmentPage', () => {
  it('shows the configured adjustable dumbbell range and adds custom equipment', async () => {
    const userId = `equip-${crypto.randomUUID()}`
    const repository = createFitileRepository(new FitileDb(), userId)
    await repository.equipment.put({ id: crypto.randomUUID(), catalogId: 'adjustable-dumbbells-home', name: 'Adjustable dumbbells', capabilities: ['dumbbell'], minKg: 5, maxKg: 25, incrementKg: 2.5, location: 'Home', available: true })

    const user = userEvent.setup()
    render(<DataProvider userId={userId}><EquipmentPage /></DataProvider>)

    expect(await screen.findByText('5–25 kg per hand')).toBeVisible()
    await user.click(screen.getByRole('button', { name: 'Add equipment' }))
    await user.type(screen.getByLabelText('Equipment name'), 'Pull-up bar')
    await user.click(screen.getByRole('button', { name: 'Save equipment' }))
    expect(await screen.findByText('Pull-up bar')).toBeVisible()
  })
})
