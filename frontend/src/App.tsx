import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store'

// Pages
import Dashboard from './pages/Dashboard'
import AnalyzePage from './pages/AnalyzePage'
import AnalysisResultPage from './pages/AnalysisResultPage'
import HistoryPage from './pages/HistoryPage'
import ApplicationsPage from './pages/ApplicationsPage'
import TasksPage from './pages/TasksPage'
import InterviewPage from './pages/InterviewPage'
import SettingsPage from './pages/SettingsPage'
import AuthPage from './pages/AuthPage'

// Guard for authenticated routes
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthStore()
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg-base)]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-[var(--color-text-secondary)]">加载中...</p>
        </div>
      </div>
    )
  }
  if (!isAuthenticated) return <Navigate to="/auth" replace />
  return <>{children}</>
}

function App() {
  return (
    <Routes>
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      <Route path="/analyze" element={
        <ProtectedRoute>
          <AnalyzePage />
        </ProtectedRoute>
      } />
      <Route path="/analyze/:id" element={
        <ProtectedRoute>
          <AnalysisResultPage />
        </ProtectedRoute>
      } />
      <Route path="/history" element={
        <ProtectedRoute>
          <HistoryPage />
        </ProtectedRoute>
      } />
      <Route path="/applications" element={
        <ProtectedRoute>
          <ApplicationsPage />
        </ProtectedRoute>
      } />
      <Route path="/tasks" element={
        <ProtectedRoute>
          <TasksPage />
        </ProtectedRoute>
      } />
      <Route path="/interview" element={
        <ProtectedRoute>
          <InterviewPage />
        </ProtectedRoute>
      } />
      <Route path="/settings" element={
        <ProtectedRoute>
          <SettingsPage />
        </ProtectedRoute>
      } />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
