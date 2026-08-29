import { useState } from 'react'
import { Check, ChevronLeft, MoreHorizontal, Plus } from 'lucide-react'
import { Button } from '../../design/components/Button'
import type { WorkoutPlan } from '../../domain/training/assembleWorkout'
import { recoveryEventsFromSets } from '../../domain/recovery/recoveryFromWorkout'
import { useRepository } from '../../data/useRepository'
import { RestTimer } from './RestTimer'
import './training.css'

type SetValue = { weight: number; reps: number; done: boolean; logId?: string }

export function ActiveWorkoutPage({ plan, sessionId, title, onFinish }: { plan: WorkoutPlan; sessionId: string; title: string; onFinish: () => void }) {
  const repository = useRepository()
  const [values, setValues] = useState<Record<string, SetValue>>({})
  const [restSeconds, setRestSeconds] = useState<number | null>(null)
  const [completed, setCompleted] = useState(0)
  const [finishing, setFinishing] = useState(false)
  const totalSets = plan.exercises.reduce((sum, item) => sum + item.sets, 0)

  const update = (key: string, patch: Partial<SetValue>, defaults: SetValue) =>
    setValues((current) => ({ ...current, [key]: { ...(current[key] ?? defaults), ...patch } }))

  const toggleSet = async (item: WorkoutPlan['exercises'][number], setIndex: number, value: SetValue, defaults: SetValue) => {
    const key = `${item.exercise.id}:${setIndex}`
    const nowDone = !value.done
    if (nowDone) {
      // Postgres keys these rows by uuid, so mint one per logged set.
      const logId = value.logId ?? crypto.randomUUID()
      update(key, { done: true, logId }, defaults)
      setCompleted((count) => count + 1)
      setRestSeconds(item.restSeconds)
      await repository.saveSet({
        id: logId, sessionId, exerciseId: item.exercise.id, setNumber: setIndex + 1,
        weightKg: value.weight || undefined, repetitions: value.reps || undefined,
        completedAt: new Date().toISOString(),
      })
    } else {
      update(key, { done: false }, defaults)
      setCompleted((count) => Math.max(0, count - 1))
      setRestSeconds(null)
      if (value.logId) await repository.deleteSet(value.logId)
    }
  }

  const finish = async () => {
    setFinishing(true)
    const sets = await repository.listSetsForSession(sessionId)
    if (sets.length > 0) {
      for (const event of recoveryEventsFromSets(sets, title)) await repository.recoveryEvents.put(event)
    }
    const existing = await repository.sessions.get(sessionId)
    await repository.sessions.put({
      id: sessionId, source: plan.source, split: plan.split, status: 'completed', plan,
      startedAt: existing?.startedAt ?? new Date().toISOString(), completedAt: new Date().toISOString(),
    })
    onFinish()
  }

  return (
    <div className="active-workout">
      <header className="active-header">
        <button aria-label="Back to workout overview" className="round-button" onClick={onFinish}><ChevronLeft /></button>
        <div><p className="eyebrow">Workout in progress</p><strong>{title}</strong></div>
        <Button variant="ghost" onClick={() => void finish()} disabled={finishing}>Finish</Button>
      </header>
      <div className="workout-progress"><i style={{ width: `${totalSets ? (completed / totalSets) * 100 : 0}%` }} /></div>
      {restSeconds !== null && <RestTimer seconds={restSeconds} />}
      <div className="active-exercises">
        {plan.exercises.map((item, index) => (
          <section className="exercise-block" key={item.exercise.id}>
            <header>
              <span className="exercise-number">{String(index + 1).padStart(2, '0')}</span>
              <div><h2>{item.exercise.name}</h2><p>{item.sets} sets · {item.repRange[0]}–{item.repRange[1]} reps · {item.restSeconds}s rest</p></div>
              <button className="round-button" aria-label={`Options for ${item.exercise.name}`}><MoreHorizontal /></button>
            </header>
            <div className="set-headings"><span>Set</span><span>kg</span><span>reps</span><span /></div>
            {Array.from({ length: item.sets }, (_, setIndex) => {
              const key = `${item.exercise.id}:${setIndex}`
              const defaults: SetValue = { weight: item.suggestedWeightKg ?? 0, reps: item.repRange[0], done: false }
              const value = values[key] ?? defaults
              return (
                <div className={value.done ? 'set-row done' : 'set-row'} key={key}>
                  <strong>{setIndex + 1}</strong>
                  <input type="number" step="0.5" aria-label={`${item.exercise.name}: weight for set ${setIndex + 1}`} value={value.weight} onChange={(event) => update(key, { weight: Number(event.target.value) }, defaults)} />
                  <input type="number" aria-label={`${item.exercise.name}: repetitions for set ${setIndex + 1}`} value={value.reps} onChange={(event) => update(key, { reps: Number(event.target.value) }, defaults)} />
                  <button aria-label={`${value.done ? 'Undo' : 'Complete'} ${item.exercise.name} set ${setIndex + 1}`} onClick={() => void toggleSet(item, setIndex, value, defaults)}>{value.done ? <Check /> : <span />}</button>
                </div>
              )
            })}
            <button className="add-set"><Plus size={16} /> Add set</button>
          </section>
        ))}
      </div>
      <div className="active-footer">
        <span>{completed} of {totalSets} sets</span>
        <Button onClick={() => void finish()} disabled={finishing}>{finishing ? 'Saving…' : 'Finish workout'}</Button>
      </div>
    </div>
  )
}
