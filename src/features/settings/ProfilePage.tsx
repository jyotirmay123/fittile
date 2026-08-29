import { useState } from 'react'
import { LogOut, Target } from 'lucide-react'
import { Button } from '../../design/components/Button'
import { Card } from '../../design/components/Card'
import type { Profile, TrainingSplit } from '../../domain/models'
import { useProfile } from '../../data/hooks'
import { useAuth } from '../auth/authContext'
import { EquipmentPage } from './EquipmentPage'
import { DataOwnershipPage } from './DataOwnershipPage'
import './settings.css'

const goalLabel: Record<Profile['goal'], string> = {
  'general-fitness': 'General fitness', 'build-muscle': 'Build muscle', strength: 'Get stronger', 'fat-loss': 'Reduce bodyweight', endurance: 'Build endurance',
}
const splitLabel: Record<TrainingSplit, string> = {
  push: 'Push / Pull / Legs', pull: 'Push / Pull / Legs', legs: 'Push / Pull / Legs', upper: 'Upper / Lower', lower: 'Upper / Lower', 'full-body': 'Full body', fresh: 'Fresh muscles', manual: 'Custom',
}

export function ProfilePage() {
  const [tab, setTab] = useState<'profile' | 'equipment' | 'data'>('profile')
  const profile = useProfile()
  const auth = useAuth()

  return (
    <div>
      <header className="page-header"><div><p className="eyebrow">Your Fitile</p><h1>Built around you.</h1><p className="muted">Goals, equipment, safety limits and ownership.</p></div></header>
      <div className="settings-tabs" role="tablist">
        {([['profile', 'Profile'], ['equipment', 'Equipment'], ['data', 'Data & sync']] as const).map(([id, label]) => (
          <button role="tab" aria-selected={tab === id} key={id} onClick={() => setTab(id)}>{label}</button>
        ))}
      </div>
      {tab === 'profile' && (
        <div className="settings-grid">
          <Card>
            <span className="icon-tile"><Target /></span>
            <p className="eyebrow">Primary goal</p>
            <h2>{profile ? goalLabel[profile.goal] : '—'}</h2>
            <p className="muted">{profile?.goalWeightKg ? `${profile.goalWeightKg} kg target · ` : ''}{profile ? `${profile.calorieTarget} kcal · ${profile.proteinTargetG} g protein` : ''}</p>
          </Card>
          <Card>
            <p className="eyebrow">Training rhythm</p>
            <h2>{profile ? `${profile.workoutDays} days per week` : '—'}</h2>
            <p className="muted">{profile ? `${splitLabel[profile.preferredSplit]} · ${profile.workoutMinutes} minutes` : ''}</p>
          </Card>
          <Card className="settings-wide">
            <p className="eyebrow">Account</p>
            <h2>{auth.user?.email ?? (auth.cloud ? 'Signed in' : 'Local account')}</h2>
            <p className="muted">{auth.cloud ? 'Your data syncs privately to your account.' : 'Running locally on this device.'}</p>
            {auth.cloud && auth.user && <Button variant="secondary" onClick={() => void auth.signOut()}><LogOut size={16} /> Sign out</Button>}
          </Card>
        </div>
      )}
      {tab === 'equipment' && <EquipmentPage />}
      {tab === 'data' && <DataOwnershipPage />}
    </div>
  )
}
