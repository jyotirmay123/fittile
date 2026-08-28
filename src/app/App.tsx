import { BrowserRouter } from 'react-router-dom'
import { AppNavigation } from '../features/navigation/AppNavigation'
import { AppErrorBoundary } from './AppErrorBoundary'
import { AppRoutes } from './routes'

export function App() {
  return (
    <AppErrorBoundary>
      <BrowserRouter>
        <a className="skip-link" href="#main-content">Skip to content</a>
        <div className="app-shell">
          <AppNavigation />
          <main className="main-content" id="main-content">
            <AppRoutes />
          </main>
        </div>
      </BrowserRouter>
    </AppErrorBoundary>
  )
}
