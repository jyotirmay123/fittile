import { type FormEvent, useState } from 'react'
import { Cloud, Dumbbell, ShieldCheck } from 'lucide-react'
import { Button } from '../../design/components/Button'
import { Card } from '../../design/components/Card'
import { useAuth } from './authContext'
import './auth.css'

export function SignInPage() {
  const auth = useAuth()
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setMessage('')
    setBusy(true)
    const result = mode === 'signin' ? await auth.signIn(email, password) : await auth.signUp(email, password)
    setBusy(false)
    if (result.error) setMessage(result.error)
    else if (result.pendingConfirmation) setMessage('Account created. Check your email to confirm, then sign in.')
  }

  return (
    <main className="auth-page">
      <Card className="auth-card">
        <div className="auth-brand"><Dumbbell size={22} /><strong>Fitile</strong></div>
        <p className="eyebrow">Your health, your data</p>
        <h1>{mode === 'signin' ? 'Welcome back.' : 'Create your account.'}</h1>
        <p className="muted">
          {mode === 'signin'
            ? 'Sign in to reach your private Fitile data on any device.'
            : 'Your workouts, recovery and nutrition stay private to your account.'}
        </p>

        <form className="auth-form" onSubmit={submit}>
          <label htmlFor="email">Email</label>
          <input id="email" type="email" autoComplete="email" required value={email}
            onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" />

          <label htmlFor="password">Password</label>
          <input id="password" type="password" required minLength={8}
            autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
            value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 8 characters" />

          <Button type="submit" disabled={busy} className="auth-submit">
            {busy ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create account'}
          </Button>
        </form>

        {message && <p className="auth-message" role="status">{message}</p>}

        <button type="button" className="auth-toggle"
          onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setMessage('') }}>
          {mode === 'signin' ? 'New here? Create an account' : 'Already have an account? Sign in'}
        </button>

        <div className="auth-assurances">
          <span><ShieldCheck size={17} /> Private account records</span>
          <span><Cloud size={17} /> Synced across your devices</span>
        </div>
      </Card>
    </main>
  )
}
