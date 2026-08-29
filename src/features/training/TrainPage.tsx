import { useState } from 'react'
import { ArrowRight, BrainCircuit, Clock3, Dumbbell, SlidersHorizontal } from 'lucide-react'
import { Button } from '../../design/components/Button'
import { Card } from '../../design/components/Card'
import type { TrainingSplit } from '../../domain/models'
import { useRepository } from '../../data/useRepository'
import { useProfile } from '../../data/hooks'
import { useRecommendedWorkout } from './useRecommendedWorkout'
import { ActiveWorkoutPage } from './ActiveWorkoutPage'
import { CoachSourceToggle } from './CoachSourceToggle'
import './training.css'

const splits: { id: TrainingSplit; label: string }[] = [
  { id: 'push', label: 'Push' }, { id: 'pull', label: 'Pull' }, { id: 'legs', label: 'Legs' },
  { id: 'upper', label: 'Upper' }, { id: 'lower', label: 'Lower' }, { id: 'full-body', label: 'Full body' }, { id: 'fresh', label: 'Fresh muscles' },
]

const labelForSplit = (split: TrainingSplit) => splits.find((item) => item.id === split)?.label ?? 'Workout'

export function TrainPage() {
  const repository = useRepository()
  const profile = useProfile()
  const [overrideSplit, setOverrideSplit] = useState<TrainingSplit | undefined>(undefined)
  const [source, setSource] = useState<'deterministic' | 'ai'>('deterministic')
  const [active, setActive] = useState<{ sessionId: string; title: string } | null>(null)
  const { plan, split } = useRecommendedWorkout(overrideSplit)

  const start = async () => {
    if (!plan) return
    const sessionId = crypto.randomUUID()
    const title = `${labelForSplit(split)} session`
    await repository.sessions.put({ id: sessionId, source: 'deterministic', split, status: 'active', plan, startedAt: new Date().toISOString() })
    setActive({ sessionId, title })
  }

  if (active && plan) return <ActiveWorkoutPage plan={plan} sessionId={active.sessionId} title={active.title} onFinish={() => setActive(null)} />

  return (
    <div className="train-page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Adaptive training</p>
          <h1>Train what’s ready.</h1>
          <p className="muted">Every movement fits your equipment, recovery and available time.</p>
        </div>
        <Button variant="secondary"><SlidersHorizontal size={18} /> {profile?.workoutMinutes ?? 45} min</Button>
      </header>

      <div className="train-controls">
        <CoachSourceToggle source={source} onChange={setSource} />
        <div className="split-scroll">
          {splits.map((item) => (
            <button key={item.id} onClick={() => setOverrideSplit(item.id)} className={split === item.id ? 'active' : ''}>{item.label}</button>
          ))}
        </div>
      </div>

      {source === 'ai' && (
        <Card className="ai-notice">
          <span className="icon-tile"><BrainCircuit /></span>
          <div>
            <strong>AI Coach needs a server key.</strong>
            <p>It can propose an alternative, then Fitile checks every exercise against the same equipment and recovery rules.</p>
          </div>
          <Button variant="secondary" onClick={() => setSource('deterministic')}>Use deterministic</Button>
        </Card>
      )}

      {!plan ? (
        <Card className="plan-summary"><p className="muted">Preparing your plan…</p></Card>
      ) : (
        <>
          <Card accent className="plan-summary">
            <div>
              <p className="eyebrow eyebrow--lime">Deterministic coach</p>
              <h2>{labelForSplit(split)} session</h2>
              <p>{plan.explanation}</p>
            </div>
            <div className="plan-meta">
              <span><Clock3 size={16} /> {plan.durationMinutes} min</span>
              <span><Dumbbell size={16} /> {plan.exercises.length} exercises</span>
            </div>
            <Button onClick={() => void start()}>Start workout <ArrowRight size={18} /></Button>
          </Card>

          <div className="exercise-list-heading">
            <div><p className="eyebrow">Today’s work</p><h2>{plan.exercises.length} exercises</h2></div>
          </div>
          <div className="plan-exercises">
            {plan.exercises.map((item, index) => (
              <Card key={item.exercise.id} className="plan-exercise">
                <span className="exercise-number">{String(index + 1).padStart(2, '0')}</span>
                <div className="plan-exercise__body">
                  <h3>{item.exercise.name}</h3>
                  <p>{item.sets} × {item.repRange[0]}–{item.repRange[1]} {item.suggestedWeightKg ? `· ${item.suggestedWeightKg} kg` : ''}</p>
                  <small>{item.reasons[0]}</small>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
      <p className="fine-print">Recommendations are training estimates. Stop for sharp pain, dizziness, chest pain or unusual shortness of breath.</p>
    </div>
  )
}
