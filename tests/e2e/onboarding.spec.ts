import { expect, test } from '@playwright/test'

test('personalizes goal, split, equipment, and schedule', async ({ page }) => {
  await page.goto('/onboarding')
  await expect(page.getByRole('heading', { name: 'What are we working toward?' })).toBeVisible()
  await page.getByRole('button', { name: 'Build muscle' }).click()
  await page.getByRole('button', { name: 'Continue' }).click()
  await page.getByRole('button', { name: 'Upper / Lower' }).click()
  await page.getByRole('button', { name: 'Continue' }).click()
  await expect(page.getByRole('heading', { name: 'What can you train with?' })).toBeVisible()
  await page.getByRole('button', { name: /Waist twister/ }).click()
  await page.getByRole('button', { name: 'Continue' }).click()
  await expect(page.getByRole('heading', { name: 'Make the plan fit real life.' })).toBeVisible()
  await expect(page.getByText('4 / week')).toBeVisible()
})

test('saves the profile and lands on a personalized Today', async ({ page }) => {
  await page.goto('/onboarding')
  await page.getByRole('button', { name: 'Build muscle' }).click()
  await page.getByRole('button', { name: 'Continue' }).click()
  await page.getByRole('button', { name: 'Continue' }).click()
  await page.getByRole('button', { name: 'Continue' }).click()
  await page.getByRole('button', { name: 'Finish setup' }).click()

  await expect(page).toHaveURL(/\/$/)
  await expect(page.getByRole('heading', { name: /ready to move\?/i })).toBeVisible()
})
