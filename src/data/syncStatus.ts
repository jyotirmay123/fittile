import { createContext, useContext } from 'react'
import type { SyncStatus } from './sync/types'

export type SyncMode = 'local' | 'cloud'

export type SyncState = {
  mode: SyncMode
  status: SyncStatus
  /** null until the outbox has been read, so the UI never claims "synced" prematurely. */
  pending: number | null
}

export const SyncStatusContext = createContext<SyncState>({ mode: 'local', status: 'idle', pending: null })

export function useSyncStatus() {
  return useContext(SyncStatusContext)
}
