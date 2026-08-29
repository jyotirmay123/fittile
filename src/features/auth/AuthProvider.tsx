import { type PropsWithChildren, useEffect, useMemo, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { cloudConfigured, supabase } from '../../integrations/supabase/client'
import { AuthContext, type AuthContextValue, type AuthResult, type AuthStatus } from './authContext'

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(cloudConfigured)

  useEffect(() => {
    if (!supabase) return
    void supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null)
      setLoading(false)
    })
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })
    return () => data.subscription.unsubscribe()
  }, [])

  const value = useMemo<AuthContextValue>(() => {
    const status: AuthStatus = !cloudConfigured ? 'local' : loading ? 'loading' : user ? 'authenticated' : 'anonymous'
    return {
      user,
      status,
      cloud: cloudConfigured,
      async signIn(email, password): Promise<AuthResult> {
        if (!supabase) return { error: 'Cloud sync is not configured.' }
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
        return error ? { error: error.message } : {}
      },
      async signUp(email, password): Promise<AuthResult> {
        if (!supabase) return { error: 'Cloud sync is not configured.' }
        const { data, error } = await supabase.auth.signUp({ email: email.trim(), password })
        if (error) {
          // A deployment can close sign-ups with a database allowlist; Supabase
          // surfaces that as a generic database error.
          if (/database error saving new user/i.test(error.message)) {
            return { error: 'Sign-ups are closed for this Fitile deployment.' }
          }
          return { error: error.message }
        }
        // If the project requires email confirmation, no session is returned yet.
        return data.session ? {} : { pendingConfirmation: true }
      },
      async signOut() {
        if (supabase) await supabase.auth.signOut()
      },
    }
  }, [loading, user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
