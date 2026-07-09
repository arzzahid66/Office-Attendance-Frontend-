import { NavLink } from 'react-router-dom'
import { useAuth } from '../AuthContext'
import useHeartbeat from '../hooks/useHeartbeat'
import ThemeToggle from './ThemeToggle'

const employeeTabs = [
  { to: '/', label: 'Today' },
  { to: '/history', label: 'History' },
]

// Capped at 5 (mobile bottom-nav guideline). Rosters / Offices / Reports live under "More".
const adminTabs = [
  { to: '/admin', label: 'Dashboard' },
  { to: '/admin/approvals', label: 'Approvals' },
  { to: '/admin/employees', label: 'Employees' },
  { to: '/admin/flagged', label: 'Flagged' },
  { to: '/admin/more', label: 'More' },
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
      <div className="content">{children}</div>
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
