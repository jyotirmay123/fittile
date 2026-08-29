import { useMemo } from 'react'
import { assembleWorkout, type WorkoutPlan } from '../../domain/training/assembleWorkout'
import { readinessByMuscle } from '../../domain/recovery/readinessMap'
import type { EquipmentCapability, Profile, TrainingSplit, UserEquipment } from '../../domain/models'
import type { RecoveryEvent } from '../../domain/models'
import { useEquipment, useProfile, useRecoveryEvents } from '../../data/hooks'

export function availableCapabilities(equipment: UserEquipment[]): EquipmentCapability[] {
  const set = new Set<EquipmentCapability>(['bodyweight'])
  for (const item of equipment) {
    if (item.available === false) continue
    for (const capability of item.capabilities) set.add(capability)
  }
  return [...set]
}

export function buildPlan(profile: Profile, equipment: UserEquipment[], events: RecoveryEvent[], split: TrainingSplit, at = new Date()): WorkoutPlan {
  return assembleWorkout({
    split,
    durationMinutes: profile.workoutMinutes,
    capabilities: availableCapabilities(equipment),
    excludedExerciseIds: [],
    readiness: readinessByMuscle(events, at),
    variability: 'balanced',
    seed: `${at.toISOString().slice(0, 10)}:${profile.id}:${split}`,
  })
}

export function useRecommendedWorkout(overrideSplit?: TrainingSplit) {
  const profile = useProfile()
  const equipment = useEquipment()
  const events = useRecoveryEvents()

  return useMemo(() => {
    if (!profile) return { plan: null as WorkoutPlan | null, split: 'full-body' as TrainingSplit, ready: false }
    const split = overrideSplit ?? profile.preferredSplit ?? 'full-body'
    return { plan: buildPlan(profile, equipment, events, split), split, ready: true }
  }, [profile, equipment, events, overrideSplit])
}
