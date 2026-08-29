import { createContext, useContext } from 'react'
import type { User } from '@supabase/supabase-js'

export type AuthStatus = 'loading' | 'authenticated' | 'anonymous' | 'local'
export type AuthResult = { error?: string; pendingConfirmation?: boolean }

export type AuthContextValue = {
  user: User | null
  status: AuthStatus
  cloud: boolean
  signIn: (email: string, password: string) => Promise<AuthResult>
  signUp: (email: string, password: string) => Promise<AuthResult>
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth() {
  const value = useContext(AuthContext)
  if (!value) throw new Error('useAuth must be used within AuthProvider')
  return value
}
