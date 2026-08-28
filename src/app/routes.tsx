import { Navigate, Route, Routes } from 'react-router-dom'
import { TodayPage } from '../features/today/TodayPage'
import { AuthCallbackPage } from '../features/auth/AuthCallbackPage'
import { ProfilePage } from '../features/settings/ProfilePage'
import { OnboardingPage } from '../features/onboarding/OnboardingPage'
import { TrainPage } from '../features/training/TrainPage'

function PlaceholderPage({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <div className="page-placeholder">
      <div className="page-placeholder__inner">
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="muted">{description}</p>
      </div>
    </div>
  )
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<TodayPage />} />
      <Route path="/train" element={<TrainPage />} />
      <Route path="/food" element={<PlaceholderPage eyebrow="Daily fuel" title="Nutrition, without guesswork." description="Meals, barcodes and editable photo estimates will live here." />} />
      <Route path="/progress" element={<PlaceholderPage eyebrow="Your signal" title="See the work add up." description="Training, recovery, activity and nutrition trends in one place." />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/onboarding" element={<OnboardingPage />} />
      <Route path="/auth/callback" element={<AuthCallbackPage />} />
      <Route path="*" element={<Navigate replace to="/" />} />
    </Routes>
  )
}
