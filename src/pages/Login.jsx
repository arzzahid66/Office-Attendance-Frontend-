import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../AuthContext'
import ThemeToggle from '../components/ThemeToggle'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      const user = await login(email, password)
      navigate(user.role === 'admin' ? '/admin' : '/')
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="center-page">
      <div style={{ position: 'absolute', top: 16, right: 16 }}>
        <ThemeToggle />
      </div>
      <div className="auth-card">
        <h1>Office Attendance</h1>
        <p className="muted">Sign in with your account</p>
        {error && <div className="error-box">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="field">
            <label>Password</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <button className="btn" type="submit" disabled={busy}>
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
        <p className="muted" style={{ marginTop: 16, textAlign: 'center' }}>
          No account? <Link to="/signup">Sign up</Link>
        </p>
      </div>
    </div>
  )
}
