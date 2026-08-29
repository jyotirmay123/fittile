export type SyncEntity =
  | 'setLogs'
  | 'workoutSessions'
  | 'mealEntries'
  | 'activities'
  | 'measurements'
  | 'settings'
  | 'profile'
  | 'equipment'
  | 'recoveryEvents'
  | 'sorenessCheckins'
  | 'foods'
  | 'hydration'

export type OutboxOperation = {
  id: string
  userId: string
  entity: SyncEntity
  entityId: string
  kind: 'upsert' | 'delete'
  payload?: unknown
  createdAt: string
  attempts: number
  nextAttemptAt?: string
}

export type SyncAcknowledgement = { operationId: string; serverUpdatedAt: string }

/** Records fetched from the server, already converted back to domain shape. */
export type PulledRecords = Partial<Record<SyncEntity, { id: string; deleted: boolean; record: unknown }[]>>

export interface SyncTransport {
  push(operation: OutboxOperation): Promise<SyncAcknowledgement>
  /** Optional: transports that can restore an account on a new device implement this. */
  pull?(userId: string): Promise<PulledRecords>
}

export type SyncStatus = 'idle' | 'syncing' | 'offline' | 'auth-required' | 'error'
