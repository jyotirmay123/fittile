import { ProgressRing } from '../../design/components/ProgressRing'
import type { Nutrients } from '../../domain/models'

export function NutritionSummary({ consumed, calorieTarget, proteinTargetG }: { consumed: Nutrients; calorieTarget: number; proteinTargetG: number }) {
  const kcal = Math.round(consumed.kcal)
  const carbTarget = Math.round((calorieTarget * 0.45) / 4)
  const fatTarget = Math.round((calorieTarget * 0.3) / 9)
  const macros: [string, number, number, string][] = [
    ['Protein', Math.round(consumed.proteinG), proteinTargetG, 'g'],
    ['Carbs', Math.round(consumed.carbohydrateG), carbTarget, 'g'],
    ['Fat', Math.round(consumed.fatG), fatTarget, 'g'],
    ['Fiber', Math.round(consumed.fiberG), 30, 'g'],
  ]
  return (
    <section className="nutrition-summary">
      <div>
        <p className="eyebrow">Daily budget</p>
        <h2><strong>{kcal}</strong> / {calorieTarget} kcal</h2>
        <p>{Math.max(0, calorieTarget - kcal)} kcal remaining</p>
      </div>
      <ProgressRing value={calorieTarget ? Math.round((kcal / calorieTarget) * 100) : 0} label="Calories consumed" size={88} color="var(--brand)" />
      <div className="macro-stack">
        {macros.map(([name, value, max, unit]) => (
          <div key={name}>
            <span>{name}</span>
            <i><b style={{ width: `${Math.min(100, max ? (value / max) * 100 : 0)}%` }} /></i>
            <strong>{value}{unit}</strong>
          </div>
        ))}
      </div>
    </section>
  )
}
