import type { UserEquipment } from '../models'

// Catalog blueprints: each gets a fresh UUID `id` when saved to a user's account.
export type EquipmentBlueprint = Omit<UserEquipment, 'id'>

export const defaultHomeEquipment: EquipmentBlueprint[] = [
  { catalogId: 'bodyweight-home', name: 'Bodyweight', capabilities: ['bodyweight'], location: 'Home', available: true },
  { catalogId: 'adjustable-dumbbells-home', name: 'Adjustable dumbbells', capabilities: ['dumbbell'], minKg: 5, maxKg: 25, incrementKg: 2.5, location: 'Home', available: true },
  { catalogId: 'adjustable-bench-home', name: 'Adjustable bench', capabilities: ['flat-bench', 'incline-bench', 'seated-bench'], location: 'Home', available: true },
  { catalogId: 'bench-cables-home', name: 'Bench cable attachments', capabilities: ['low-cable', 'high-cable', 'resistance-band'], location: 'Home', available: true },
  { catalogId: 'twister-home', name: 'Waist twister', capabilities: ['twister'], location: 'Home', available: true },
  { catalogId: 'treadmill-home', name: 'Treadmill', capabilities: ['treadmill'], location: 'Home', available: true },
]
