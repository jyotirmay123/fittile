import { useRef, useState } from 'react'
import { Cloud, CloudOff, Download, FileJson, LogOut, RotateCcw, Shield, Trash2, Upload } from 'lucide-react'
import { Button } from '../../design/components/Button'
import { Card } from '../../design/components/Card'
import { createArchive, type AccountSnapshot } from '../../domain/export/createArchive'
import { createCsvBundle } from '../../domain/export/createCsvBundle'
import { restoreArchive } from '../../domain/export/restoreArchive'
import { saveTextFile } from '../../integrations/download/saveFile'
import { useActivities, useEquipment, useMeals, useMeasurements, useProfile, useSessions, useSets } from '../../data/hooks'
import { useRepository } from '../../data/useRepository'
import { useSyncStatus } from '../../data/syncStatus'
import { useAuth } from '../auth/authContext'

export function DataOwnershipPage() {
  const auth = useAuth()
  const sync = useSyncStatus()
  const repository = useRepository()
  const profile = useProfile()
  const sessions = useSessions()
  const sets = useSets()
  const meals = useMeals()
  const activities = useActivities()
  const measurements = useMeasurements()
  const equipment = useEquipment()
  const fileRef = useRef<HTMLInputElement>(null)
  const [restoreMessage, setRestoreMessage] = useState('')
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  const snapshot = (): AccountSnapshot => ({
    workouts: sessions.map((session) => ({ id: session.id, split: session.split, status: session.status, startedAt: session.startedAt, completedAt: session.completedAt })),
    sets: sets.map((set) => ({ id: set.id, sessionId: set.sessionId, exerciseId: set.exerciseId, weightKg: set.weightKg, repetitions: set.repetitions, completedAt: set.completedAt })),
    meals: meals.map((meal) => ({ id: meal.id, meal: meal.meal, food: meal.snapshot.name, grams: meal.grams, eatenAt: meal.eatenAt })),
    activities: activities.map((activity) => ({ id: activity.id, type: activity.type, minutes: activity.minutes, kcal: activity.caloriesKcal, startedAt: activity.startedAt })),
    measurements: measurements.map((measurement) => ({ id: measurement.id, measuredAt: measurement.measuredAt, weightKg: measurement.weightKg })),
    settings: profile ? { goal: profile.goal, calorieTarget: profile.calorieTarget, proteinTargetG: profile.proteinTargetG, units: profile.units } : {},
    equipment: equipment.map((item) => ({ name: item.name, capabilities: item.capabilities, minKg: item.minKg, maxKg: item.maxKg })),
  })

  const exportJson = () => saveTextFile(`fittile-export-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(createArchive(snapshot()), null, 2), 'application/json')
  const exportCsv = () => { for (const [name, content] of Object.entries(createCsvBundle(snapshot()))) saveTextFile(name, content, 'text/csv') }
  const restore = async (file?: File) => {
    if (!file) return
    try {
      const data = restoreArchive(JSON.parse(await file.text()))
      setRestoreMessage(`Archive is valid: ${data.workouts.length} workout, ${data.meals.length} meal and ${data.activities.length} activity records ready to review.`)
    } catch {
      setRestoreMessage('This file is not a compatible Fitile V1 archive. No data was changed.')
    }
  }
  const deleteAccount = async () => {
    await repository.clearAll()
    setConfirmingDelete(false)
    await auth.signOut()
  }

  return (
    <section className="settings-grid">
      <Card>
        <span className="icon-tile">{sync.mode === 'cloud' ? <Cloud /> : <CloudOff />}</span>
        <p className="eyebrow">Synchronization</p>
        <h2>{sync.mode === 'cloud' ? 'Fitile cloud' : 'Local only'}</h2>
        <p className="muted">{sync.mode === 'cloud' ? ((sync.pending ?? 0) > 0 ? `${sync.pending} change(s) syncing…` : 'All account records are scoped to your signed-in identity and synced privately.') : 'This device keeps your data locally. Sign-in enables cross-device sync.'}</p>
      </Card>
      <Card>
        <span className="icon-tile"><FileJson /></span>
        <p className="eyebrow">Complete archive</p>
        <h2>Export everything</h2>
        <p className="muted">Versioned JSON for full restore, plus readable CSV tables.</p>
        <div className="data-actions"><Button onClick={exportJson}><Download size={16} /> JSON</Button><Button variant="secondary" onClick={exportCsv}>CSV files</Button></div>
      </Card>
      <Card>
        <span className="icon-tile"><RotateCcw /></span>
        <p className="eyebrow">Restore</p>
        <h2>Bring your data back</h2>
        <p className="muted">Fitile validates the archive before applying any records.</p>
        <input ref={fileRef} hidden type="file" accept="application/json,.json" onChange={(event) => void restore(event.target.files?.[0])} />
        <Button variant="secondary" onClick={() => fileRef.current?.click()}><Upload size={16} /> Choose archive</Button>
        {restoreMessage && <p className="restore-message" role="status">{restoreMessage}</p>}
      </Card>
      <Card>
        <span className="icon-tile"><Shield /></span>
        <p className="eyebrow">Ownership</p>
        <h2>Your data stays yours.</h2>
        <p className="muted">Export or restore anytime. {auth.cloud && auth.user ? 'You can sign out or delete your account below.' : ''}</p>
        {auth.cloud && auth.user && <Button variant="secondary" onClick={() => void auth.signOut()}><LogOut size={16} /> Sign out</Button>}
      </Card>
      <Card className="settings-wide danger-zone">
        <Trash2 />
        <div><h2>Delete account data</h2><p className="muted">Removes every workout, meal, activity and measurement from this device{sync.mode === 'cloud' ? ' and queues deletion from the cloud' : ''}. This cannot be undone.</p></div>
        {confirmingDelete
          ? <div className="data-actions"><Button variant="ghost" onClick={() => setConfirmingDelete(false)}>Cancel</Button><Button variant="secondary" onClick={() => void deleteAccount()}>Confirm delete</Button></div>
          : <Button variant="ghost" onClick={() => setConfirmingDelete(true)}>Delete data</Button>}
      </Card>
    </section>
  )
}
