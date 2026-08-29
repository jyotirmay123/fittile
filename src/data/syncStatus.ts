import { createContext, useContext } from 'react'
import type { SyncStatus } from './sync/types'

export type SyncMode = 'local' | 'cloud'

export type SyncState = {
  mode: SyncMode
  status: SyncStatus
  /** null until the outbox has been read, so the UI never claims "synced" prematurely. */
  pending: number | null
  /** False until the account has been restored from the server. */
  hydrated: boolean
}

export const SyncStatusContext = createContext<SyncState>({ mode: 'local', status: 'idle', pending: null, hydrated: true })

export function useSyncStatus() {
  return useContext(SyncStatusContext)
}
