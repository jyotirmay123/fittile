import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FoodPage } from './FoodPage'
import { DataProvider } from '../../data/DataProvider'

const renderFood = () => render(<DataProvider userId={`food-${crypto.randomUUID()}`}><FoodPage /></DataProvider>)

describe('FoodPage', () => {
  it('adds a searched food and logs it into the daily diary', async () => {
    const user = userEvent.setup()
    renderFood()

    // Fresh account starts at zero consumed against the default target.
    expect(screen.getByText(/\/ 2000 kcal/)).toBeVisible()

    await user.click(screen.getByRole('button', { name: 'Add food' }))
    await user.click(screen.getByRole('button', { name: /add skyr yoghurt/i }))

    expect(await screen.findByText('Skyr yoghurt')).toBeVisible()
  })
})
