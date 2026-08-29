import { useState } from 'react'
import { Button } from '../../design/components/Button'
import type { MuscleId } from '../../domain/models'
import { muscleById } from '../../domain/catalog/muscles'
import { useRepository } from '../../data/useRepository'

export function SorenessCheckIn({ muscleId }: { muscleId: MuscleId }) {
  const repository = useRepository()
  const [value, setValue] = useState(2)
  const [saved, setSaved] = useState(false)
  const save = async () => {
    await repository.soreness.put({ id: crypto.randomUUID(), muscleId, soreness: value, checkedAt: new Date().toISOString() })
    setSaved(true)
  }
  return (
    <div className="soreness">
      <label htmlFor="soreness">How does your {muscleById[muscleId].name.toLowerCase()} feel? <strong>{value}/10</strong></label>
      <input id="soreness" type="range" min="0" max="10" value={value} onChange={(event) => { setValue(Number(event.target.value)); setSaved(false) }} />
      <div className="soreness-scale"><span>No soreness</span><span>Very sore</span></div>
      <Button variant="secondary" onClick={() => void save()}>{saved ? 'Check-in saved' : 'Save check-in'}</Button>
    </div>
  )
}
