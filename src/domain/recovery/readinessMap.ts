import type { MuscleId, RecoveryEvent } from '../models'
import { calculateReadiness, type ReadinessResult } from './calculateReadiness'

export function groupRecoveryByMuscle(events: RecoveryEvent[]): Map<MuscleId, RecoveryEvent[]> {
  const byMuscle = new Map<MuscleId, RecoveryEvent[]>()
  for (const event of events) {
    const bucket = byMuscle.get(event.muscleId)
    if (bucket) bucket.push(event)
    else byMuscle.set(event.muscleId, [event])
  }
  return byMuscle
}

export function readinessDetails(events: RecoveryEvent[], at = new Date()): Map<MuscleId, ReadinessResult> {
  const details = new Map<MuscleId, ReadinessResult>()
  for (const [muscleId, muscleEvents] of groupRecoveryByMuscle(events)) {
    details.set(muscleId, calculateReadiness(muscleEvents, at))
  }
  return details
}

export function readinessByMuscle(events: RecoveryEvent[], at = new Date()): Partial<Record<MuscleId, number>> {
  const map: Partial<Record<MuscleId, number>> = {}
  for (const [muscleId, result] of readinessDetails(events, at)) map[muscleId] = result.percent
  return map
}
