import type { Profile } from '../../domain/models'
import { defaultHomeEquipment } from '../../domain/catalog/equipment'

export const demoProfile: Profile = {
  id: 'demo-user',
  displayName: 'Jyotirmay',
  birthYear: 1990,
  heightCm: 178,
  weightKg: 80,
  goalWeightKg: 74,
  experience: 'intermediate',
  goal: 'fat-loss',
  preferredSplit: 'push',
  workoutDays: 4,
  workoutMinutes: 50,
  calorieTarget: 2000,
  proteinTargetG: 150,
  locale: 'en-DE',
  units: 'metric',
}

export const demoEquipment = defaultHomeEquipment
