import { useState } from 'react'
import { Cloud, Download, LogIn, Shield, Target } from 'lucide-react'
import { Button } from '../../design/components/Button'
import { Card } from '../../design/components/Card'
import { cloudConfigured } from '../../integrations/supabase/client'
import { useAuth } from '../auth/authContext'
import { SignInPage } from '../auth/SignInPage'
import { EquipmentPage } from './EquipmentPage'
import './settings.css'

export function ProfilePage() {
  const [tab, setTab] = useState<'profile'|'equipment'|'data'>('profile')
  const auth = useAuth()
  return <div><header className="page-header"><div><p className="eyebrow">Your Fitile</p><h1>Built around you.</h1><p className="muted">Goals, equipment, safety limits and ownership.</p></div></header><div className="settings-tabs" role="tablist">{([['profile','Profile'],['equipment','Equipment'],['data','Data & sync']] as const).map(([id,label]) => <button role="tab" aria-selected={tab===id} key={id} onClick={() => setTab(id)}>{label}</button>)}</div>{tab==='profile' && <div className="settings-grid"><Card><p className="eyebrow">Primary goal</p><h2>Reduce bodyweight</h2><p className="muted">74 kg target · steady pace</p><span className="icon-tile"><Target/></span></Card><Card><p className="eyebrow">Training rhythm</p><h2>4 days per week</h2><p className="muted">Push / Pull / Legs · 50 minutes</p></Card><Card className="settings-wide"><p className="eyebrow">Safety filters</p><h2>No active limitations</h2><p className="muted">Add a limitation or soreness check-in anytime. Fitile treats these as constraints, not diagnoses.</p><Button variant="secondary">Review limitations</Button></Card></div>}{tab==='equipment' && <EquipmentPage/>}{tab==='data' && <div className="settings-grid"><Card><span className="icon-tile"><Cloud/></span><h2>{auth.status==='demo'?'Demo mode':'Synchronized'}</h2><p className="muted">{auth.status==='demo'?'Data stays on this device until Supabase is configured.':'Your records synchronize through your private account.'}</p>{auth.status==='anonymous' && <Button onClick={() => void auth.signInWithGoogle()}><LogIn size={17}/> Continue with Google</Button>}</Card><Card><span className="icon-tile"><Download/></span><h2>Export everything</h2><p className="muted">Download versioned JSON and human-readable CSV files.</p><Button variant="secondary">Prepare export</Button></Card><Card className="settings-wide"><span className="icon-tile"><Shield/></span><h2>You remain in control.</h2><p className="muted">Restore an archive, remove synchronized records, or delete your account from one place.</p></Card>{!cloudConfigured && <div className="settings-signin-preview"><SignInPage cloudConfigured={false} onGoogleSignIn={auth.signInWithGoogle}/></div>}</div>}</div>
}
