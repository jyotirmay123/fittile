import type { Table } from 'dexie'
import type {
  Activity,
  BodyMeasurement,
  Food,
  HydrationLog,
  MealEntry,
  Profile,
  RecoveryEvent,
  SetLog,
  SorenessCheckin,
  UserEquipment,
  WorkoutSession,
} from '../../domain/models'
import type { OutboxOperation, SyncEntity } from '../sync/types'
import type { FitileDb, SyncMeta } from './FitileDb'

const nowIso = () => new Date().toISOString()

export type FitileRepository = ReturnType<typeof createFitileRepository>

export function createFitileRepository(db: FitileDb, userId: string) {
  function collection<T extends { id: string }>(table: Table, entity: SyncEntity | null) {
    return {
      async put(item: T): Promise<T & SyncMeta> {
        const timestamp = nowIso()
        const existing = (await table.get(item.id)) as (T & SyncMeta) | undefined
        const record = {
          ...item,
          userId,
          createdAt: existing?.createdAt ?? timestamp,
          updatedAt: timestamp,
          deletedAt: undefined,
        } as T & SyncMeta
        await db.transaction('rw', table, db.outbox, async () => {
          await table.put(record)
          if (entity) {
            const operation: OutboxOperation = {
              id: crypto.randomUUID(), userId, entity, entityId: item.id,
              kind: 'upsert', payload: record, createdAt: timestamp, attempts: 0,
            }
            await db.outbox.add(operation)
          }
        })
        return record
      },
      async get(id: string): Promise<(T & SyncMeta) | undefined> {
        const record = (await table.get(id)) as (T & SyncMeta) | undefined
        if (!record || record.deletedAt || record.userId !== userId) return undefined
        return record
      },
      async list(): Promise<(T & SyncMeta)[]> {
        const records = (await table.where('userId').equals(userId).toArray()) as (T & SyncMeta)[]
        return records.filter((record) => !record.deletedAt)
      },
      async remove(id: string) {
        const record = (await table.get(id)) as (T & SyncMeta) | undefined
        if (!record || record.userId !== userId) return
        const timestamp = nowIso()
        await db.transaction('rw', table, db.outbox, async () => {
          await table.update(id, { deletedAt: timestamp, updatedAt: timestamp })
          if (entity) {
            const operation: OutboxOperation = {
              id: crypto.randomUUID(), userId, entity, entityId: id,
              kind: 'delete', createdAt: timestamp, attempts: 0,
            }
            await db.outbox.add(operation)
          }
        })
      },
    }
  }

  const setLogs = collection<SetLog>(db.setLogs, 'setLogs')
  const sessions = collection<WorkoutSession>(db.workoutSessions, 'workoutSessions')
  const recoveryEvents = collection<RecoveryEvent>(db.recoveryEvents, 'recoveryEvents')
  const soreness = collection<SorenessCheckin>(db.sorenessCheckins, 'sorenessCheckins')
  const foods = collection<Food>(db.foods, 'foods')
  const meals = collection<MealEntry>(db.mealEntries, 'mealEntries')
  const hydration = collection<HydrationLog>(db.hydration, 'hydration')
  const activities = collection<Activity>(db.activities, 'activities')
  const measurements = collection<BodyMeasurement>(db.measurements, 'measurements')
  const equipment = collection<UserEquipment>(db.equipment, 'equipment')
  const profiles = collection<Profile>(db.profiles, 'profile')

  return {
    db,
    userId,
    // Collections
    setLogs, sessions, recoveryEvents, soreness, foods, meals, hydration, activities, measurements, equipment,

    // Profile is a per-user singleton keyed by the auth user id.
    async getProfile() {
      return profiles.get(userId)
    },
    async saveProfile(profile: Omit<Profile, 'id'>) {
      return profiles.put({ ...profile, id: userId })
    },

    // Tombstones every user-owned record locally (and queues the deletions for sync).
    async clearAll() {
      const all = [setLogs, sessions, recoveryEvents, soreness, foods, meals, hydration, activities, measurements, equipment, profiles]
      for (const store of all) {
        for (const record of await store.list()) await store.remove(record.id)
      }
    },

    // Legacy set-log helpers (kept for stable API + existing tests).
    async saveSet(set: SetLog) {
      return setLogs.put(set)
    },
    async getSet(id: string) {
      return setLogs.get(id)
    },
    async listSets() {
      return setLogs.list()
    },
    async listSetsForSession(sessionId: string) {
      return (await setLogs.list()).filter((set) => set.sessionId === sessionId)
    },
    async deleteSet(id: string) {
      return setLogs.remove(id)
    },

    // Outbox / sync plumbing.
    async pendingOperations(at = new Date()) {
      const operations = await db.outbox.where('userId').equals(userId).sortBy('createdAt')
      return operations.filter((operation) => !operation.nextAttemptAt || new Date(operation.nextAttemptAt) <= at)
    },
    async acknowledgeOperation(id: string) {
      await db.outbox.delete(id)
    },
    async deferOperation(operation: OutboxOperation) {
      const attempts = operation.attempts + 1
      const delaySeconds = Math.min(300, 2 ** attempts)
      await db.outbox.update(operation.id, {
        attempts,
        nextAttemptAt: new Date(Date.now() + delaySeconds * 1000).toISOString(),
      })
    },
  }
}
