import Dexie, { type EntityTable } from 'dexie'
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
import type { OutboxOperation } from '../sync/types'

export type SyncMeta = { userId: string; createdAt: string; updatedAt: string; deletedAt?: string }

export type StoredSetLog = SetLog & SyncMeta
export type StoredWorkoutSession = WorkoutSession & SyncMeta
export type StoredRecoveryEvent = RecoveryEvent & SyncMeta
export type StoredSorenessCheckin = SorenessCheckin & SyncMeta
export type StoredFood = Food & SyncMeta
export type StoredMealEntry = MealEntry & SyncMeta
export type StoredHydration = HydrationLog & SyncMeta
export type StoredActivity = Activity & SyncMeta
export type StoredMeasurement = BodyMeasurement & SyncMeta
export type StoredEquipment = UserEquipment & SyncMeta
export type StoredProfile = Profile & SyncMeta

export type SyncConflictRecord = {
  id: string
  entity: string
  entityId: string
  winner: unknown
  loser: unknown
  createdAt: string
}

export class FitileDb extends Dexie {
  setLogs!: EntityTable<StoredSetLog, 'id'>
  workoutSessions!: EntityTable<StoredWorkoutSession, 'id'>
  recoveryEvents!: EntityTable<StoredRecoveryEvent, 'id'>
  sorenessCheckins!: EntityTable<StoredSorenessCheckin, 'id'>
  foods!: EntityTable<StoredFood, 'id'>
  mealEntries!: EntityTable<StoredMealEntry, 'id'>
  hydration!: EntityTable<StoredHydration, 'id'>
  activities!: EntityTable<StoredActivity, 'id'>
  measurements!: EntityTable<StoredMeasurement, 'id'>
  equipment!: EntityTable<StoredEquipment, 'id'>
  profiles!: EntityTable<StoredProfile, 'id'>
  outbox!: EntityTable<OutboxOperation, 'id'>
  syncConflicts!: EntityTable<SyncConflictRecord, 'id'>
  settings!: EntityTable<{ id: string; userId: string; value: unknown; updatedAt: string }, 'id'>

  constructor(name = 'fittile') {
    super(name)
    this.version(1).stores({
      setLogs: '&id, userId, sessionId, exerciseId, completedAt, deletedAt',
      outbox: '&id, userId, [entity+entityId], createdAt, nextAttemptAt',
      syncConflicts: '&id, [entity+entityId], createdAt',
      settings: '&id, userId, updatedAt',
    })
    this.version(2).stores({
      setLogs: '&id, userId, sessionId, exerciseId, completedAt, deletedAt',
      workoutSessions: '&id, userId, status, startedAt, deletedAt',
      recoveryEvents: '&id, userId, muscleId, occurredAt, deletedAt',
      sorenessCheckins: '&id, userId, muscleId, checkedAt, deletedAt',
      foods: '&id, userId, barcode, updatedAt, deletedAt',
      mealEntries: '&id, userId, meal, eatenAt, deletedAt',
      hydration: '&id, userId, loggedAt, deletedAt',
      activities: '&id, userId, startedAt, deletedAt',
      measurements: '&id, userId, measuredAt, deletedAt',
      equipment: '&id, userId, updatedAt, deletedAt',
      profiles: '&id, userId, updatedAt, deletedAt',
      outbox: '&id, userId, [entity+entityId], createdAt, nextAttemptAt',
      syncConflicts: '&id, [entity+entityId], createdAt',
      settings: '&id, userId, updatedAt',
    })
  }
}
