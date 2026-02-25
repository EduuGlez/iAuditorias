import { Routes, Route, Navigate } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout'
import AuditsPage from './pages/AuditsPage'
import AuditDetailPage from './pages/AuditDetailPage'
import CreateAuditPage from './pages/CreateAuditPage'

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Navigate to="/audits" replace />} />
        <Route path="/audits" element={<AuditsPage />} />
        <Route path="/audits/new" element={<CreateAuditPage />} />
        <Route path="/audits/:id" element={<AuditDetailPage />} />
      </Route>
    </Routes>
  )
}
