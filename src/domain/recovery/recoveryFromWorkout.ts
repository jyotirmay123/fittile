import { exerciseById } from '../catalog/exercises'
import { muscleById } from '../catalog/muscles'
import type { MuscleId, RecoveryEvent, SetLog } from '../models'

const FATIGUE_PER_SET = 14

const clamp = (value: number) => Math.max(0, Math.min(100, value))

// Aggregates completed sets into one recovery event per stimulated muscle.
export function recoveryEventsFromSets(sets: Pick<SetLog, 'exerciseId'>[], sourceLabel: string, at = new Date()): RecoveryEvent[] {
  const fatigueByMuscle = new Map<MuscleId, number>()
  for (const set of sets) {
    const exercise = exerciseById[set.exerciseId]
    if (!exercise) continue
    for (const muscle of exercise.muscles) {
      const added = FATIGUE_PER_SET * muscle.contribution
      fatigueByMuscle.set(muscle.muscleId, (fatigueByMuscle.get(muscle.muscleId) ?? 0) + added)
    }
  }
  const occurredAt = at.toISOString()
  return [...fatigueByMuscle.entries()].map(([muscleId, fatigue]) => ({
    id: crypto.randomUUID(),
    muscleId,
    fatigue: clamp(fatigue),
    occurredAt,
    recoveryHours: muscleById[muscleId]?.defaultRecoveryHours ?? 48,
    sourceLabel,
  }))
}
