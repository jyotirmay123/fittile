import { expect, test } from '@playwright/test'
import { completeOnboarding } from './helpers'

test('adds a food and opens barcode entry', async ({ page }) => {
  await completeOnboarding(page)
  await page.goto('/food')
  await page.getByRole('button', { name: 'Add food' }).click()
  await page.getByRole('button', { name: 'Add Skyr yoghurt' }).click()
  await expect(page.getByText('Skyr yoghurt')).toBeVisible()
  await page.getByRole('button', { name: /Scan barcode/ }).click()
  await page.getByLabel('Enter barcode number').fill('4008400401829')
  await expect(page.getByRole('button', { name: 'Look up' })).toBeEnabled()
})

test('a logged food updates the daily calorie budget', async ({ page }) => {
  await completeOnboarding(page)
  await page.goto('/food')
  await page.getByRole('button', { name: 'Add food' }).click()
  await page.getByRole('button', { name: 'Add Skyr yoghurt' }).click()
  // 150 g of skyr at 63 kcal/100 g = 95 kcal, shown in the meal section and the daily budget.
  await expect(page.getByRole('heading', { name: '95 kcal' })).toBeVisible()
  await expect(page.locator('.nutrition-summary')).toContainText('95')
})
