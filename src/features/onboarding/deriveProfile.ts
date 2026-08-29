import { defaultHomeEquipment } from '../../domain/catalog/equipment'
import type { Profile, TrainingSplit, UserEquipment } from '../../domain/models'
import type { OnboardingData } from './onboardingSchema'

const splitByPreference: Record<OnboardingData['split'], TrainingSplit> = {
  'push-pull-legs': 'push',
  'upper-lower': 'upper',
  'full-body': 'full-body',
  fresh: 'fresh',
}

const equipmentById: Record<string, string> = {
  'adjustable-dumbbells': 'adjustable-dumbbells-home',
  'adjustable-bench': 'adjustable-bench-home',
  'bench-cables': 'bench-cables-home',
  twister: 'twister-home',
  treadmill: 'treadmill-home',
}

const proteinPerKg: Record<OnboardingData['goal'], number> = {
  'general-fitness': 1.6,
  'build-muscle': 2,
  strength: 1.9,
  'fat-loss': 2,
  endurance: 1.6,
}

const calorieAdjustment: Record<OnboardingData['goal'], number> = {
  'general-fitness': 0,
  'build-muscle': 250,
  strength: 150,
  'fat-loss': -400,
  endurance: 0,
}

export function deriveTargets(weightKg: number, goal: OnboardingData['goal']) {
  const maintenance = Math.round(weightKg * 31)
  const calorieTarget = Math.max(1400, maintenance + calorieAdjustment[goal])
  const proteinTargetG = Math.round(weightKg * proteinPerKg[goal])
  return { calorieTarget, proteinTargetG }
}

export function deriveProfile(data: OnboardingData, displayName: string, locale = 'en-US'): Omit<Profile, 'id'> {
  const { calorieTarget, proteinTargetG } = deriveTargets(data.weightKg, data.goal)
  return {
    displayName,
    weightKg: data.weightKg,
    experience: data.experience,
    goal: data.goal,
    preferredSplit: splitByPreference[data.split],
    workoutDays: data.workoutDays,
    workoutMinutes: data.workoutMinutes,
    calorieTarget,
    proteinTargetG,
    locale,
    units: 'metric',
  }
}

export function deriveEquipment(selected: string[]): UserEquipment[] {
  const chosen = new Set(selected.map((id) => equipmentById[id]).filter(Boolean))
  return defaultHomeEquipment
    .filter((item) => item.catalogId === 'bodyweight-home' || chosen.has(item.catalogId ?? ''))
    .map((item) => ({ ...item, id: crypto.randomUUID() }))
}
