import { useMemo } from 'react'
import { muscleById } from '../../domain/catalog/muscles'
import { sumNutrition } from '../../domain/nutrition/calculateNutrition'
import { readinessDetails } from '../../domain/recovery/readinessMap'
import type { MuscleId } from '../../domain/models'
import { useActivities, useHydration, useMeals, useProfile, useRecoveryEvents, useSets } from '../../data/hooks'
import { useRecommendedWorkout } from '../training/useRecommendedWorkout'

const isToday = (iso: string) => new Date(iso).toDateString() === new Date().toDateString()

export type MuscleReadiness = { id: MuscleId; name: string; value: number; state: 'fresh' | 'recovering' | 'fatigued' }

export function useTodaySummary() {
  const profile = useProfile()
  const events = useRecoveryEvents()
  const meals = useMeals()
  const activities = useActivities()
  const hydration = useHydration()
  const sets = useSets()
  const { plan, split } = useRecommendedWorkout()

  return useMemo(() => {
    const details = readinessDetails(events)

    const targetMuscleIds = new Set<MuscleId>()
    for (const item of plan?.exercises ?? []) {
      for (const muscle of item.exercise.muscles) if (muscle.role === 'primary') targetMuscleIds.add(muscle.muscleId)
    }
    const targetMuscles: MuscleReadiness[] = [...targetMuscleIds].map((id) => {
      const detail = details.get(id)
      return { id, name: muscleById[id]?.name ?? id, value: detail?.percent ?? 100, state: detail?.state ?? 'fresh' }
    }).sort((a, b) => a.value - b.value).slice(0, 4)

    const trained = [...details.values()]
    const overallReadiness = trained.length ? Math.round(trained.reduce((sum, d) => sum + d.percent, 0) / trained.length) : 100

    const consumed = sumNutrition(
      meals.filter((meal) => isToday(meal.eatenAt)).map((meal) => ({ grams: meal.grams, nutrientsPer100g: meal.snapshot.nutrientsPer100g })),
    )
    const activitiesToday = activities.filter((activity) => isToday(activity.startedAt))
    const hydrationMl = hydration.filter((entry) => isToday(entry.loggedAt)).reduce((sum, entry) => sum + entry.milliliters, 0)
    const setsToday = sets.filter((set) => isToday(set.completedAt)).length

    return {
      profile,
      greetingName: profile?.displayName || 'there',
      overallReadiness,
      plan,
      split,
      targetMuscles,
      nutrition: {
        consumed,
        calorieTarget: profile?.calorieTarget ?? 2000,
        proteinTargetG: profile?.proteinTargetG ?? 140,
      },
      activitiesToday,
      hydrationMl,
      setsToday,
    }
  }, [profile, events, meals, activities, hydration, sets, plan, split])
}
