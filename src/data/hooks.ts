import { useCallback } from 'react'
import type {
  Activity,
  BodyMeasurement,
  Food,
  HydrationLog,
  MealEntry,
  Profile,
  RecoveryEvent,
  SorenessCheckin,
  UserEquipment,
  WorkoutSession,
} from '../domain/models'
import type { StoredSetLog } from './local/FitileDb'
import { useRepository } from './useRepository'
import { useFitileLiveQuery } from './useLiveQuery'

export function useProfile(): Profile | undefined {
  const repository = useRepository()
  const query = useCallback(() => repository.getProfile(), [repository])
  return useFitileLiveQuery<Profile | undefined>(query, undefined)
}

export function useEquipment(): UserEquipment[] {
  const repository = useRepository()
  const query = useCallback(() => repository.equipment.list(), [repository])
  return useFitileLiveQuery<UserEquipment[]>(query, [])
}

export function useSets(): StoredSetLog[] {
  const repository = useRepository()
  const query = useCallback(() => repository.listSets(), [repository])
  return useFitileLiveQuery<StoredSetLog[]>(query, [])
}

export function useSessions(): WorkoutSession[] {
  const repository = useRepository()
  const query = useCallback(() => repository.sessions.list(), [repository])
  return useFitileLiveQuery<WorkoutSession[]>(query, [])
}

export function useActiveSession(): WorkoutSession | undefined {
  const repository = useRepository()
  const query = useCallback(async () => {
    const sessions = await repository.sessions.list()
    return sessions.find((session) => session.status === 'active')
  }, [repository])
  return useFitileLiveQuery<WorkoutSession | undefined>(query, undefined)
}

export function useRecoveryEvents(): RecoveryEvent[] {
  const repository = useRepository()
  const query = useCallback(() => repository.recoveryEvents.list(), [repository])
  return useFitileLiveQuery<RecoveryEvent[]>(query, [])
}

export function useSoreness(): SorenessCheckin[] {
  const repository = useRepository()
  const query = useCallback(() => repository.soreness.list(), [repository])
  return useFitileLiveQuery<SorenessCheckin[]>(query, [])
}

export function useMeals(): MealEntry[] {
  const repository = useRepository()
  const query = useCallback(() => repository.meals.list(), [repository])
  return useFitileLiveQuery<MealEntry[]>(query, [])
}

export function useFoods(): Food[] {
  const repository = useRepository()
  const query = useCallback(() => repository.foods.list(), [repository])
  return useFitileLiveQuery<Food[]>(query, [])
}

export function useActivities(): Activity[] {
  const repository = useRepository()
  const query = useCallback(() => repository.activities.list(), [repository])
  return useFitileLiveQuery<Activity[]>(query, [])
}

export function useMeasurements(): BodyMeasurement[] {
  const repository = useRepository()
  const query = useCallback(() => repository.measurements.list(), [repository])
  return useFitileLiveQuery<BodyMeasurement[]>(query, [])
}

export function useHydration(): HydrationLog[] {
  const repository = useRepository()
  const query = useCallback(() => repository.hydration.list(), [repository])
  return useFitileLiveQuery<HydrationLog[]>(query, [])
}
