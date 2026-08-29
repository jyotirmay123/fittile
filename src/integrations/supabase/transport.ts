import type { SupabaseClient } from '@supabase/supabase-js'
import type { OutboxOperation, SyncEntity, SyncTransport } from '../../data/sync/types'
import { SyncAuthError } from '../../data/sync/SyncEngine'

const tableByEntity: Record<SyncEntity, string> = {
  setLogs: 'set_logs',
  workoutSessions: 'workout_sessions',
  mealEntries: 'meal_entries',
  activities: 'activities',
  measurements: 'body_measurements',
  settings: 'user_preferences',
  profile: 'profiles',
  equipment: 'user_equipment',
  recoveryEvents: 'recovery_events',
  sorenessCheckins: 'soreness_checkins',
  foods: 'foods',
  hydration: 'hydration_logs',
}

const toSnakeCase = (key: string) => key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)

const dropMeta = (payload: Record<string, unknown>) =>
  Object.fromEntries(Object.entries(payload).filter(([key]) => !['userId', 'createdAt', 'updatedAt', 'deletedAt'].includes(key)))

// Flatten every field to snake_case columns (used by tables with dedicated columns).
const flatten = (payload: Record<string, unknown>, userId: string) => ({
  ...Object.fromEntries(Object.entries(dropMeta(payload)).map(([key, value]) => [toSnakeCase(key), value])),
  user_id: userId,
})

// Tables that store the domain object inside a single jsonb column.
const jsonbBuilders: Partial<Record<SyncEntity, (p: Record<string, unknown>, userId: string) => Record<string, unknown>>> = {
  profile: (p, userId) => ({ id: userId, user_id: userId, display_name: p.displayName ?? '', profile_data: dropMeta(p) }),
  workoutSessions: (p, userId) => ({ id: p.id, user_id: userId, source: p.source, split: p.split, status: p.status, session_data: dropMeta(p), started_at: p.startedAt, completed_at: p.completedAt ?? null }),
  equipment: (p, userId) => ({ id: p.id, user_id: userId, name: p.name, capabilities: p.capabilities ?? [], equipment_data: dropMeta(p) }),
  activities: (p, userId) => ({ id: p.id, user_id: userId, activity_type: p.type, activity_data: dropMeta(p), started_at: p.startedAt }),
  measurements: (p, userId) => ({ id: p.id, user_id: userId, measurement_data: dropMeta(p), measured_at: p.measuredAt }),
  foods: (p, userId) => ({ id: p.id, user_id: userId, name: p.name, brand: p.brand, barcode: p.barcode, source: p.source, source_id: p.sourceId, food_data: dropMeta(p) }),
  mealEntries: (p, userId) => ({ id: p.id, user_id: userId, food_id: null, grams: p.grams, food_snapshot: dropMeta(p), eaten_at: p.eatenAt }),
  settings: (p, userId) => ({ id: p.id, user_id: userId, value: dropMeta(p) }),
}

export function toSupabaseMutation(operation: OutboxOperation) {
  const payload = operation.payload && typeof operation.payload === 'object' ? (operation.payload as Record<string, unknown>) : {}
  const builder = jsonbBuilders[operation.entity]
  return {
    table: tableByEntity[operation.entity],
    kind: operation.kind,
    row: builder ? builder(payload, operation.userId) : flatten(payload, operation.userId),
  }
}

export class SupabaseSyncTransport implements SyncTransport {
  constructor(private client: SupabaseClient) {}

  async push(operation: OutboxOperation) {
    const mutation = toSupabaseMutation(operation)
    const query = operation.kind === 'delete'
      ? this.client.from(mutation.table).update({ deleted_at: operation.createdAt }).eq('id', operation.entityId)
      : this.client.from(mutation.table).upsert(mutation.row, { onConflict: 'id' })
    const { error } = await query
    if (error?.code === 'PGRST301' || error?.message.toLowerCase().includes('jwt')) throw new SyncAuthError(error.message)
    if (error) throw new Error(error.message)
    return { operationId: operation.id, serverUpdatedAt: new Date().toISOString() }
  }
}
