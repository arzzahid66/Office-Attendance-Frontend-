import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './AuthContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Today from './pages/Today'
import History from './pages/History'
import WfhRequest from './pages/WfhRequest'
import ScheduleRequest from './pages/ScheduleRequest'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminEmployees from './pages/admin/AdminEmployees'
import AdminNetworks from './pages/admin/AdminNetworks'
import AdminWfh from './pages/admin/AdminWfh'
import AdminSchedule from './pages/admin/AdminSchedule'
import AdminReports from './pages/admin/AdminReports'
import AdminFlagged from './pages/admin/AdminFlagged'

function ProtectedRoute({ role, children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="center-page">Loading…</div>
  if (!user) return <Navigate to="/login" replace />
  if (role && user.role !== role) return <Navigate to={user.role === 'admin' ? '/admin' : '/'} replace />
  return children
}

function AppRoutes() {
  const { user, loading } = useAuth()

  if (loading) return <div className="center-page">Loading…</div>

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to={user.role === 'admin' ? '/admin' : '/'} replace /> : <Login />} />
      <Route path="/signup" element={user ? <Navigate to="/" replace /> : <Signup />} />

      <Route
        path="/"
        element={
          <ProtectedRoute role="employee">
            <Layout>
              <Today />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/history"
        element={
          <ProtectedRoute role="employee">
            <Layout>
              <History />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/wfh"
        element={
          <ProtectedRoute role="employee">
            <Layout>
              <WfhRequest />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/schedule"
        element={
          <ProtectedRoute role="employee">
            <Layout>
              <ScheduleRequest />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin"
        element={
          <ProtectedRoute role="admin">
            <Layout>
              <AdminDashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/employees"
        element={
          <ProtectedRoute role="admin">
            <Layout>
              <AdminEmployees />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/networks"
        element={
          <ProtectedRoute role="admin">
            <Layout>
              <AdminNetworks />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/wfh"
        element={
          <ProtectedRoute role="admin">
            <Layout>
              <AdminWfh />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/schedule"
        element={
          <ProtectedRoute role="admin">
            <Layout>
              <AdminSchedule />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/reports"
        element={
          <ProtectedRoute role="admin">
            <Layout>
              <AdminReports />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/flagged"
        element={
          <ProtectedRoute role="admin">
            <Layout>
              <AdminFlagged />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
