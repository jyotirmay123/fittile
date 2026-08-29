import { readFileSync } from 'node:fs'
import { toSupabaseMutation } from './transport'
import type { OutboxOperation, SyncEntity } from '../../data/sync/types'

describe('toSupabaseMutation', () => {
  it('maps an outbox upsert to its table and snake-case metadata', () => {
    expect(toSupabaseMutation({
      id: 'op-1', userId: 'user-1', entity: 'setLogs', entityId: 'set-1', kind: 'upsert',
      payload: { id: 'set-1', weightKg: 12.5 }, createdAt: '2026-08-28T20:00:00.000Z', attempts: 0,
    })).toEqual({
      table: 'set_logs',
      kind: 'upsert',
      row: { id: 'set-1', weight_kg: 12.5, user_id: 'user-1' },
    })
  })

  // Guards the bug class where a payload field became a column that does not exist,
  // which stalls the whole outbox behind the rejected row.
  it('only produces columns that exist in the Postgres schema', () => {
    const schema = readFileSync('supabase/migrations/202608280001_core_schema.sql', 'utf8')
    const columnsOf = (table: string) => {
      const match = new RegExp(`create table public\\.${table} \\(([\\s\\S]*?)\\n?\\);`, 'm').exec(schema)
        ?? new RegExp(`create table public\\.${table} \\((.*)\\);`, 'm').exec(schema)
      if (!match) throw new Error(`table ${table} not found in schema`)
      return new Set([...match[1].matchAll(/(?:^|,)\s*([a-z_]+)\s+(?:uuid|text|jsonb|numeric|integer|timestamptz|boolean|text\[\])/g)].map((m) => m[1]))
    }

    const payloads: Record<SyncEntity, Record<string, unknown>> = {
      setLogs: { id: 'a', sessionId: 'b', exerciseId: 'db-bench-press', setNumber: 1, weightKg: 10, repetitions: 8, durationSeconds: 1, distanceMeters: 2, rpe: 7, rir: 2, completedAt: 'now' },
      workoutSessions: { id: 'a', source: 'deterministic', split: 'push', status: 'completed', plan: { any: 'shape' }, startedAt: 'now', completedAt: 'now' },
      mealEntries: { id: 'a', foodId: 'f', meal: 'lunch', grams: 100, eatenAt: 'now', snapshot: { name: 'x' } },
      activities: { id: 'a', type: 'walking', startedAt: 'now', minutes: 30, caloriesKcal: 100, calorieOrigin: 'estimated' },
      measurements: { id: 'a', measuredAt: 'now', weightKg: 80 },
      settings: { id: 'a', anything: true },
      profile: { id: 'u', displayName: 'You', weightKg: 80, goal: 'fat-loss' },
      equipment: { id: 'a', catalogId: 'x', name: 'Dumbbells', capabilities: ['dumbbell'], location: 'Home', available: true },
      recoveryEvents: { id: 'a', muscleId: 'chest', fatigue: 40, occurredAt: 'now', recoveryHours: 72, sourceLabel: 'Push' },
      sorenessCheckins: { id: 'a', muscleId: 'chest', soreness: 3, readinessOverride: 50, checkedAt: 'now' },
      foods: { id: 'a', name: 'Skyr', brand: null, barcode: null, source: 'custom', sourceId: null, servingGrams: 150 },
      hydration: { id: 'a', milliliters: 250, loggedAt: 'now' },
    }

    for (const [entity, payload] of Object.entries(payloads) as [SyncEntity, Record<string, unknown>][]) {
      const operation: OutboxOperation = { id: 'op', userId: 'u', entity, entityId: 'a', kind: 'upsert', payload, createdAt: 'now', attempts: 0 }
      const mutation = toSupabaseMutation(operation)
      const columns = columnsOf(mutation.table)
      const unknown = Object.keys(mutation.row).filter((column) => !columns.has(column))
      expect({ entity, unknown }).toEqual({ entity, unknown: [] })
    }
  })
})
