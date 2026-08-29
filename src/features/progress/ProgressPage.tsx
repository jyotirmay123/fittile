import { useMemo, useState } from 'react'
import { Activity, ArrowUpRight, CalendarCheck, Dumbbell, Footprints, Plus, Scale, X } from 'lucide-react'
import { Button } from '../../design/components/Button'
import { Card } from '../../design/components/Card'
import { useActivities, useMeasurements, useProfile, useSessions, useSets } from '../../data/hooks'
import { useRepository } from '../../data/useRepository'
import { ActivityEditor } from '../activity/ActivityEditor'
import './progress.css'

const WEEK = 7 * 86_400_000

export function ProgressPage() {
  const repository = useRepository()
  const profile = useProfile()
  const sets = useSets()
  const sessions = useSessions()
  const activities = useActivities()
  const measurements = useMeasurements()
  const [logging, setLogging] = useState(false)

  const latestWeight = useMemo(() => {
    const sorted = [...measurements].filter((m) => m.weightKg != null).sort((a, b) => b.measuredAt.localeCompare(a.measuredAt))
    return sorted[0]?.weightKg ?? profile?.weightKg
  }, [measurements, profile])

  const stats = useMemo(() => {
    const now = new Date().getTime()
    const totalVolume = sets.reduce((sum, set) => sum + (set.weightKg ?? 0) * (set.repetitions ?? 0), 0)
    const weekAgo = now - WEEK
    const sessionsThisWeek = sessions.filter((s) => s.status === 'completed' && new Date(s.completedAt ?? s.startedAt).getTime() >= weekAgo).length
    const planned = profile?.workoutDays ?? 4
    const adherence = planned ? Math.min(100, Math.round((sessionsThisWeek / planned) * 100)) : 0
    const activeMinutes = activities.filter((a) => new Date(a.startedAt).getTime() >= weekAgo).reduce((sum, a) => sum + a.minutes, 0)

    const buckets = Array.from({ length: 7 }, () => 0)
    for (const set of sets) {
      const weeksAgo = Math.floor((now - new Date(set.completedAt).getTime()) / WEEK)
      if (weeksAgo >= 0 && weeksAgo < 7) buckets[6 - weeksAgo] += (set.weightKg ?? 0) * (set.repetitions ?? 0)
    }
    const maxBucket = Math.max(1, ...buckets)
    return { totalVolume, sessionsThisWeek, adherence, activeMinutes, buckets, maxBucket }
  }, [sets, sessions, activities, profile])

  const labels = ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'Now']
  const hasData = sets.length > 0 || activities.length > 0 || sessions.length > 0

  const saveActivity = async (draft: { type: 'walking' | 'running' | 'treadmill' | 'cycling' | 'custom'; minutes: number; caloriesKcal: number; estimated: boolean; distanceKm?: number }) => {
    await repository.activities.put({
      id: crypto.randomUUID(), type: draft.type, startedAt: new Date().toISOString(), minutes: draft.minutes,
      distanceMeters: draft.distanceKm ? Math.round(draft.distanceKm * 1000) : undefined,
      caloriesKcal: draft.caloriesKcal, calorieOrigin: draft.estimated ? 'estimated' : 'manual',
    })
    setLogging(false)
  }

  return (
    <div className="progress-page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Progress</p>
          <h1>See the work add up.</h1>
          <p className="muted">Training, body and movement—without false certainty.</p>
        </div>
        <Button onClick={() => setLogging(true)}><Plus size={18} /> Log activity</Button>
      </header>

      {!hasData && <Card className="insight-card"><span className="icon-tile"><Activity /></span><div><p className="eyebrow">No data yet</p><h2>Log a workout or activity</h2><p>Your trends appear here once you have a few entries. Nothing is estimated from an empty history.</p></div></Card>}

      <div className="metric-grid">
        <Card><span className="icon-tile"><CalendarCheck /></span><p className="eyebrow">Adherence (7d)</p><h2>{stats.adherence}%</h2><small>{stats.sessionsThisWeek} of {profile?.workoutDays ?? 4} planned sessions</small></Card>
        <Card><span className="icon-tile"><Dumbbell /></span><p className="eyebrow">Training volume</p><h2>{(stats.totalVolume / 1000).toFixed(1)}t</h2><small>{sets.length} sets logged</small></Card>
        <Card><span className="icon-tile"><Scale /></span><p className="eyebrow">Body weight</p><h2>{latestWeight ? `${latestWeight} kg` : '—'}</h2><small>{measurements.length > 0 ? 'Latest measurement' : 'From your profile'}</small></Card>
        <Card><span className="icon-tile"><Footprints /></span><p className="eyebrow">Active minutes (7d)</p><h2>{stats.activeMinutes}</h2><small><ArrowUpRight /> {activities.length} activities total</small></Card>
      </div>

      <div className="progress-grid">
        <Card className="chart-card">
          <div className="chart-heading"><div><p className="eyebrow">Load trend</p><h2>Weekly training volume</h2></div></div>
          <div className="bar-chart" aria-label="Weekly training volume by week">
            {stats.buckets.map((value, index) => (
              <div key={labels[index]}><i style={{ height: `${Math.max(4, (value / stats.maxBucket) * 100)}%` }} className={index === 6 ? 'current' : ''} /><span>{labels[index]}</span></div>
            ))}
          </div>
        </Card>
        <Card className="recent-activity">
          <p className="eyebrow">Recent activity</p>
          {activities.length === 0 ? <p className="muted">No activities logged yet.</p> : (
            <ul className="activity-log">
              {[...activities].sort((a, b) => b.startedAt.localeCompare(a.startedAt)).slice(0, 5).map((a) => (
                <li key={a.id}><strong>{a.type}</strong><span>{a.minutes} min · {Math.round(a.caloriesKcal ?? 0)} kcal</span></li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <p className="fine-print">Trends need enough data and are not health diagnoses. Energy and one-rep maximum values are estimates.</p>

      {logging && (
        <div className="sheet-backdrop" role="presentation">
          <aside className="food-sheet" role="dialog" aria-modal="true" aria-label="Log activity">
            <header><div><p className="eyebrow">Movement</p><h2>Log activity</h2></div><button aria-label="Close" onClick={() => setLogging(false)}><X /></button></header>
            <ActivityEditor weightKg={latestWeight ?? 75} onSave={(activity) => void saveActivity(activity)} />
          </aside>
        </div>
      )}
    </div>
  )
}
