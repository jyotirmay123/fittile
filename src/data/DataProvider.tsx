import { type PropsWithChildren, useEffect, useMemo, useState } from 'react'
import { supabase } from '../integrations/supabase/client'
import { SupabaseSyncTransport } from '../integrations/supabase/transport'
import { FitileDb } from './local/FitileDb'
import { createFitileRepository, type FitileRepository } from './local/repositories'
import { SyncEngine } from './sync/SyncEngine'
import type { OutboxOperation, SyncStatus } from './sync/types'
import { SyncStatusContext, type SyncState } from './syncStatus'
import { useFitileLiveQuery } from './useLiveQuery'
import { RepositoryContext } from './useRepository'

const sharedDb = new FitileDb()

function SyncController({ repository, cloud, children }: PropsWithChildren<{ repository: FitileRepository; cloud: boolean }>) {
  const [status, setStatus] = useState<SyncStatus>('idle')
  const outbox = useFitileLiveQuery<OutboxOperation[] | null>(() => repository.pendingOperations(), null)
  const pending = outbox?.length ?? null

  // One engine per repository: recreating it per change would let flushes overlap
  // and deliver operations out of order.
  const engine = useMemo(
    () => (cloud && supabase ? new SyncEngine(repository, new SupabaseSyncTransport(supabase)) : null),
    [repository, cloud],
  )

  useEffect(() => {
    if (!engine) return
    let cancelled = false
    const flush = async () => {
      await engine.flush()
      if (engine.lastError) console.warn('[fitile:sync]', engine.status, engine.lastError)
      if (!cancelled) setStatus(engine.status)
    }
    void flush()
    const onOnline = () => void flush()
    window.addEventListener('online', onOnline)
    const interval = window.setInterval(() => void flush(), 20_000)
    return () => {
      cancelled = true
      window.removeEventListener('online', onOnline)
      window.clearInterval(interval)
    }
  }, [engine, pending])

  const value = useMemo<SyncState>(
    () => ({ mode: cloud ? 'cloud' : 'local', status, pending }),
    [cloud, status, pending],
  )
  return <SyncStatusContext.Provider value={value}>{children}</SyncStatusContext.Provider>
}

export function DataProvider({ children, userId, cloud = false }: PropsWithChildren<{ userId: string; cloud?: boolean }>) {
  const repository = useMemo(() => createFitileRepository(sharedDb, userId), [userId])
  return (
    <RepositoryContext.Provider value={repository}>
      <SyncController repository={repository} cloud={cloud}>{children}</SyncController>
    </RepositoryContext.Provider>
  )
}
