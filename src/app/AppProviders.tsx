import { type PropsWithChildren, useCallback } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { DataProvider } from '../data/DataProvider'
import { useFitileLiveQuery } from '../data/useLiveQuery'
import { useRepository } from '../data/useRepository'
import { AuthProvider } from '../features/auth/AuthProvider'
import { SignInPage } from '../features/auth/SignInPage'
import { useAuth } from '../features/auth/authContext'
import type { Profile } from '../domain/models'

function Splash({ label }: { label: string }) {
  return (
    <main className="page-placeholder">
      <div><p className="eyebrow">Fitile</p><h1>{label}</h1></div>
    </main>
  )
}

function OnboardingGate({ children }: PropsWithChildren) {
  const repository = useRepository()
  const location = useLocation()
  const query = useCallback(async () => (await repository.getProfile()) ?? null, [repository])
  const profile = useFitileLiveQuery<Profile | null | undefined>(query, undefined)

  if (profile === undefined) return <Splash label="Loading your data…" />
  if (profile === null && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />
  }
  return <>{children}</>
}

function Gate({ children }: PropsWithChildren) {
  const auth = useAuth()

  if (auth.cloud && auth.status === 'loading') return <Splash label="Connecting…" />
  if (auth.cloud && auth.status !== 'authenticated') return <SignInPage />

  const userId = auth.user?.id ?? 'local-user'
  return (
    <DataProvider userId={userId} cloud={auth.cloud}>
      <OnboardingGate>{children}</OnboardingGate>
    </DataProvider>
  )
}

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <AuthProvider>
      <Gate>{children}</Gate>
    </AuthProvider>
  )
}
