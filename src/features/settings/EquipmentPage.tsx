import { useState } from 'react'
import { Cable, Dumbbell, Gauge, Plus, RotateCw, Rows3 } from 'lucide-react'
import { Button } from '../../design/components/Button'
import { Card } from '../../design/components/Card'
import { useEquipment } from '../../data/hooks'
import { useRepository } from '../../data/useRepository'

const iconByCapability = { dumbbell: Dumbbell, 'flat-bench': Rows3, 'low-cable': Cable, twister: RotateCw, treadmill: Gauge, bodyweight: Dumbbell }

export function EquipmentPage() {
  const repository = useRepository()
  const equipment = useEquipment()
  const items = equipment.filter((item) => item.catalogId !== 'bodyweight-home')
  const [adding, setAdding] = useState(false)
  const [name, setName] = useState('')

  const save = async () => {
    if (!name.trim()) return
    await repository.equipment.put({ id: crypto.randomUUID(), name: name.trim(), capabilities: ['bodyweight'], location: 'Home', available: true })
    setName('')
    setAdding(false)
  }
  const toggle = (id: string, available: boolean) => {
    const item = items.find((entry) => entry.id === id)
    if (item) void repository.equipment.put({ ...item, available: !available })
  }

  return (
    <section className="settings-section">
      <div className="section-heading">
        <div><p className="eyebrow">Recommendation filter</p><h2>Home equipment</h2></div>
        <Button variant="secondary" onClick={() => setAdding(true)}><Plus size={17} /> Add equipment</Button>
      </div>
      <div className="equipment-list">
        {items.length === 0 && <p className="muted">No equipment yet. Add what you train with so recommendations fit.</p>}
        {items.map((item) => {
          const Icon = iconByCapability[item.capabilities[0] as keyof typeof iconByCapability] ?? Dumbbell
          return (
            <Card key={item.id} className="equipment-row">
              <span className="icon-tile"><Icon size={20} /></span>
              <div><strong>{item.name}</strong><small>{item.maxKg ? `${item.minKg}–${item.maxKg} kg per hand` : item.location}</small></div>
              <button className={item.available ? 'availability active' : 'availability'} onClick={() => toggle(item.id, item.available)}>{item.available ? 'Available' : 'Paused'}</button>
            </Card>
          )
        })}
      </div>
      {adding && (
        <Card className="inline-form">
          <label htmlFor="equipment-name">Equipment name</label>
          <input id="equipment-name" aria-label="Equipment name" autoFocus value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Pull-up bar" />
          <div><Button variant="ghost" onClick={() => setAdding(false)}>Cancel</Button><Button onClick={() => void save()}>Save equipment</Button></div>
        </Card>
      )}
    </section>
  )
}
