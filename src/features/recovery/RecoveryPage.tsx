import { useState } from 'react'
import { Clock3, Info, TrendingUp } from 'lucide-react'
import { Card } from '../../design/components/Card'
import { ProgressRing } from '../../design/components/ProgressRing'
import { muscleById } from '../../domain/catalog/muscles'
import type { MuscleId } from '../../domain/models'
import { readinessDetails } from '../../domain/recovery/readinessMap'
import { useRecoveryEvents } from '../../data/hooks'
import { MuscleMap } from './MuscleMap'
import { SorenessCheckIn } from './SorenessCheckIn'
import './recovery.css'

const color = (value: number) => (value >= 75 ? 'var(--fresh)' : value >= 40 ? 'var(--recovering)' : 'var(--fatigued)')

export function RecoveryPage() {
  const events = useRecoveryEvents()
  const [selected, setSelected] = useState<MuscleId>('chest')

  const details = readinessDetails(events)
  const readiness: Partial<Record<MuscleId, number>> = Object.fromEntries([...details].map(([id, detail]) => [id, detail.percent]))
  const trained = [...details.values()]
  const overall = trained.length ? Math.round(trained.reduce((sum, d) => sum + d.percent, 0) / trained.length) : 100

  const detail = details.get(selected)
  const value = detail?.percent ?? 100
  const contributors = detail?.contributors ?? []

  return (
    <div className="recovery-page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Recovery</p>
          <h1>Listen to the work.</h1>
          <p className="muted">Readiness gradually returns as training fatigue decays.</p>
        </div>
        <ProgressRing value={overall} label="Whole body readiness" size={76} color={color(overall)} />
      </header>
      <div className="recovery-layout">
        <Card className="map-card">
          <div className="recovery-legend"><span><i className="fresh" />Fresh</span><span><i className="recovering" />Recovering</span><span><i className="fatigued" />Fatigued</span></div>
          <MuscleMap readiness={readiness} selected={selected} onSelect={setSelected} />
          <p className="fine-print">Color is paired with percentages and state labels for accessibility.</p>
        </Card>
        <div className="recovery-details">
          <Card>
            <p className="eyebrow">Selected muscle</p>
            <div className="selected-readiness">
              <div><h2>{muscleById[selected].name}</h2><strong>{value}% ready</strong></div>
              <ProgressRing value={value} label={`${muscleById[selected].name} readiness`} size={72} color={color(value)} />
            </div>
            <div className="recovery-stat">
              <Clock3 />
              <div>
                <strong>{detail && detail.hoursToFresh > 0 ? `About ${detail.hoursToFresh} hours to fresh` : 'Ready to train'}</strong>
                <span>Estimated from your recent training load</span>
              </div>
            </div>
            <div className="contributors">
              <p className="eyebrow">What affected this</p>
              {contributors.length === 0 && <p className="muted">No recent training load on this muscle.</p>}
              {contributors.map((contributor, index) => (
                <article key={`${contributor.label}-${index}`}>
                  <span className="event-dot" />
                  <div><strong>{contributor.label}</strong><small>Recent training load</small></div>
                  <b>−{contributor.remainingFatigue}</b>
                </article>
              ))}
            </div>
          </Card>
          <Card>
            <div className="info-title"><Info /><div><h2>How readiness works</h2><p>Sets create estimated fatigue for primary and secondary muscles. It then decays with time and your feedback.</p></div></div>
            <div className="recovery-stat"><TrendingUp /><div><strong>Transparent, not physiological</strong><span>You can override any value when your body feels different.</span></div></div>
          </Card>
          <Card><SorenessCheckIn muscleId={selected} /></Card>
        </div>
      </div>
    </div>
  )
}
