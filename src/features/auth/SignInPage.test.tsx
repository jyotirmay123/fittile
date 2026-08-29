import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SignInPage } from './SignInPage'
import { AuthProvider } from './AuthProvider'

const renderSignIn = () => render(<AuthProvider><SignInPage /></AuthProvider>)

describe('SignInPage', () => {
  it('offers an email and password sign-in form', () => {
    renderSignIn()
    expect(screen.getByLabelText('Email')).toBeVisible()
    expect(screen.getByLabelText('Password')).toBeVisible()
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeEnabled()
  })

  it('lets a new user switch to account creation', async () => {
    const user = userEvent.setup()
    renderSignIn()
    await user.click(screen.getByRole('button', { name: /create an account/i }))
    expect(screen.getByRole('button', { name: 'Create account' })).toBeVisible()
  })
})
