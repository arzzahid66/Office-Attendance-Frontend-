import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './auth/AuthContext'
import Layout from './components/Layout'
import Login from './auth/Login'
import Signup from './auth/Signup'
import Today from './attendance/Today'
import History from './attendance/History'
import AdminDashboard from './admin/AdminDashboard'
import AdminApprovals from './admin/AdminApprovals'
import AdminEmployees from './admin/AdminEmployees'
import AdminRosters from './rosters/AdminRosters'
import AdminOffices from './offices/AdminOffices'
import AdminReports from './reports/AdminReports'
import AdminFlagged from './admin/AdminFlagged'
import AdminMore from './admin/AdminMore'

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
        path="/admin/approvals"
        element={
          <ProtectedRoute role="admin">
            <Layout>
              <AdminApprovals />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/rosters"
        element={
          <ProtectedRoute role="admin">
            <Layout>
              <AdminRosters />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/offices"
        element={
          <ProtectedRoute role="admin">
            <Layout>
              <AdminOffices />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/more"
        element={
          <ProtectedRoute role="admin">
            <Layout>
              <AdminMore />
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
