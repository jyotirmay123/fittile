import { ArrowUpRight, ChevronRight, Cloud, CloudOff, Flame, Plus, RefreshCw, Salad } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../../design/components/Button'
import { Card } from '../../design/components/Card'
import { ProgressRing } from '../../design/components/ProgressRing'
import type { TrainingSplit } from '../../domain/models'
import { useSyncStatus } from '../../data/syncStatus'
import { useTodaySummary } from './useTodaySummary'
import './today.css'

const splitLabel: Record<TrainingSplit, string> = {
  push: 'Push day', pull: 'Pull day', legs: 'Leg day', upper: 'Upper body',
  lower: 'Lower body', 'full-body': 'Full body', fresh: 'Fresh muscles', manual: 'Custom workout',
}

const readinessColor = (value: number) => (value >= 75 ? 'var(--fresh)' : value >= 40 ? 'var(--recovering)' : 'var(--fatigued)')

function SyncPill() {
  const sync = useSyncStatus()
  if (sync.mode === 'local') return <span className="sync-pill"><CloudOff size={14} /> Local only</span>
  if (sync.status === 'offline') return <span className="sync-pill"><CloudOff size={14} /> Offline · saved</span>
  if (sync.pending === null || sync.pending > 0 || sync.status === 'syncing') {
    return <span className="sync-pill"><RefreshCw size={14} /> Saving…</span>
  }
  return <span className="sync-pill sync-pill--ok"><Cloud size={14} /> All changes synced</span>
}

export function TodayPage() {
  const navigate = useNavigate()
  const summary = useTodaySummary()
  const { plan, nutrition } = summary

  const today = new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })
  const kcalConsumed = Math.round(nutrition.consumed.kcal)
  const kcalLeft = Math.max(0, nutrition.calorieTarget - kcalConsumed)
  const kcalPct = Math.min(100, nutrition.calorieTarget ? (kcalConsumed / nutrition.calorieTarget) * 100 : 0)
  const activityMinutes = summary.activitiesToday.reduce((sum, a) => sum + a.minutes, 0)
  const activityKcal = Math.round(summary.activitiesToday.reduce((sum, a) => sum + (a.caloriesKcal ?? 0), 0))
  const initials = (summary.profile?.displayName || 'You').slice(0, 2).toUpperCase()

  return (
    <div className="today-page">
      <header className="page-header">
        <div>
          <p className="eyebrow">{today}</p>
          <h1>Hi {summary.greetingName}, ready to move?</h1>
          <p className="muted">{summary.setsToday > 0 ? `${summary.setsToday} sets logged today. Keep the momentum.` : 'Your plan is ready when you are.'}</p>
        </div>
        <button className="avatar-button" aria-label="Open profile" onClick={() => navigate('/profile')}>{initials}</button>
      </header>

      <div className="today-syncbar"><SyncPill /></div>

      <section className="today-grid" aria-label="Daily overview">
        <Card accent className="workout-hero" aria-labelledby="recommended-title">
          <div className="workout-hero__topline">
            <span>Deterministic coach</span>
            <span>{summary.profile?.workoutMinutes ?? 45} min</span>
          </div>
          <div>
            <p className="eyebrow eyebrow--lime">Today’s recommendation</p>
            <h2 id="recommended-title">{splitLabel[summary.split]}</h2>
            <p>{plan ? `${plan.exercises.length} exercises` : 'Preparing your plan…'}</p>
          </div>
          <div className="muscle-chips" aria-label="Target muscles">
            {summary.targetMuscles.map((muscle) => <span key={muscle.id}>{muscle.name} {muscle.value}%</span>)}
          </div>
          <div className="workout-hero__actions">
            <Button onClick={() => navigate('/train')}>Start workout <ArrowUpRight size={18} /></Button>
            <Button variant="ghost" onClick={() => navigate('/train')}>Adjust</Button>
          </div>
        </Card>

        <Card className="readiness-card" aria-labelledby="readiness-title">
          <div className="card-heading">
            <div><p className="eyebrow">Recovery</p><h2 id="readiness-title">Muscle readiness</h2></div>
            <ProgressRing value={summary.overallReadiness} label="Overall readiness" size={68} color={readinessColor(summary.overallReadiness)} />
          </div>
          <div className="readiness-list">
            {summary.targetMuscles.length === 0 && <p className="muted">Log a workout to start tracking recovery.</p>}
            {summary.targetMuscles.map((muscle) => (
              <div key={muscle.id} className="readiness-row">
                <span>{muscle.name}</span>
                <span className="readiness-bar"><i style={{ width: `${muscle.value}%`, background: readinessColor(muscle.value) }} /></span>
                <strong>{muscle.value}%</strong>
              </div>
            ))}
          </div>
          <Link className="text-link" to="/recovery">View body map <ChevronRight size={17} /></Link>
        </Card>

        <Card className="nutrition-card" aria-labelledby="nutrition-title">
          <div className="card-heading">
            <div><p className="eyebrow">Nutrition</p><h2 id="nutrition-title">{kcalLeft.toLocaleString()} kcal left</h2></div>
            <span className="icon-tile"><Salad aria-hidden="true" size={21} /></span>
          </div>
          <div className="calorie-track" aria-label={`${kcalConsumed} of ${nutrition.calorieTarget} calories consumed`}><i style={{ width: `${kcalPct}%` }} /></div>
          <div className="macro-grid">
            <div><strong>{Math.round(nutrition.consumed.proteinG)}<span>g</span></strong><small>Protein</small></div>
            <div><strong>{Math.round(nutrition.consumed.carbohydrateG)}<span>g</span></strong><small>Carbs</small></div>
            <div><strong>{Math.round(nutrition.consumed.fatG)}<span>g</span></strong><small>Fat</small></div>
          </div>
          <button className="text-link" onClick={() => navigate('/food')}><Plus size={17} /> Log a meal</button>
        </Card>

        <Card className="activity-card" aria-labelledby="activity-title">
          <div className="card-heading">
            <div><p className="eyebrow">Movement</p><h2 id="activity-title">{activityMinutes} min active</h2></div>
            <span className="icon-tile icon-tile--amber"><Flame aria-hidden="true" size={21} /></span>
          </div>
          <p className="muted">{summary.activitiesToday.length > 0 ? `${summary.activitiesToday.length} activities · ${activityKcal} kcal estimated` : 'No activity logged today.'}</p>
          <button className="text-link" onClick={() => navigate('/progress')}>View progress <ChevronRight size={17} /></button>
        </Card>
      </section>

      <Button className="quick-add" aria-label="Quick add" onClick={() => navigate('/food')}><Plus size={22} /> <span>Quick add</span></Button>
      <p className="fine-print today-disclaimer">Recovery and calorie values are estimates, not medical measurements.</p>
    </div>
  )
}
