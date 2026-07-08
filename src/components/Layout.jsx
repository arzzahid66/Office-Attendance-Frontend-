import { NavLink } from 'react-router-dom'
import { useAuth } from '../AuthContext'
import useHeartbeat from '../hooks/useHeartbeat'
import CheckBanner from './CheckBanner'
import ThemeToggle from './ThemeToggle'

const employeeTabs = [
  { to: '/', label: 'Today' },
  { to: '/history', label: 'History' },
  { to: '/wfh', label: 'WFH' },
  { to: '/schedule', label: 'Hours' },
]

const adminTabs = [
  { to: '/admin', label: 'Dashboard' },
  { to: '/admin/employees', label: 'Employees' },
  { to: '/admin/networks', label: 'Networks' },
  { to: '/admin/wfh', label: 'WFH' },
  { to: '/admin/schedule', label: 'Hours' },
  { to: '/admin/reports', label: 'Reports' },
  { to: '/admin/flagged', label: 'Flagged' },
]

export default function Layout({ children }) {
  const { user, logout } = useAuth()
  const isEmployee = user?.role === 'employee'
  const tabs = user?.role === 'admin' ? adminTabs : employeeTabs

  useHeartbeat(isEmployee)

  return (
    <div className="app">
      <div className="topbar">
        <h1>Office Attendance</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="role-badge">{user?.role}</span>
          <ThemeToggle />
          <button className="link-btn" onClick={logout}>
            Logout
          </button>
        </div>
      </div>
      <div className="content">
        {isEmployee && <CheckBanner />}
        {children}
      </div>
      <nav className="tabbar">
        {tabs.map((t) => (
          <NavLink key={t.to} to={t.to} end className={({ isActive }) => (isActive ? 'active' : '')}>
            {t.label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
