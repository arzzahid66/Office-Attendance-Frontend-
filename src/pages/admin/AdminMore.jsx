import { Link } from 'react-router-dom'

// Bottom nav is capped at 5 items (mobile nav guideline), so secondary admin destinations
// live here rather than cramming a 7-item tab bar into 480px.
const LINKS = [
  { to: '/admin/rosters', label: 'Shifts / rosters', desc: 'Timings, working days, default shift' },
  { to: '/admin/offices', label: 'Offices', desc: 'Public IPs, coordinates, radius' },
  { to: '/admin/reports', label: 'Reports', desc: 'Monthly summary + CSV export' },
]

export default function AdminMore() {
  return (
    <div>
      <h2 style={{ fontSize: 16, marginTop: 0 }}>More</h2>
      {LINKS.map((l) => (
        <Link key={l.to} to={l.to} style={{ textDecoration: 'none' }}>
          <div className="card" style={{ padding: 14 }}>
            <strong>{l.label}</strong>
            <p className="muted" style={{ margin: '2px 0 0' }}>{l.desc}</p>
          </div>
        </Link>
      ))}
    </div>
  )
}
