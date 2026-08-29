import type { Page } from '@playwright/test'

// A fresh browser profile has no saved Fitile profile, so the app routes to
// onboarding first. This walks the wizard so a journey starts on a real account.
export async function completeOnboarding(page: Page) {
  await page.goto('/onboarding')
  for (let step = 0; step < 3; step += 1) {
    await page.getByRole('button', { name: 'Continue' }).click()
  }
  await page.getByRole('button', { name: 'Finish setup' }).click()
  await page.waitForURL((url) => !url.pathname.startsWith('/onboarding'))
}
