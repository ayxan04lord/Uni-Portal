import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './LoginPage.css'

const LoginPage = () => {
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const user = await login(form.username, form.password)
      navigate(user.role === 'teacher' ? '/teacher' : '/student', { replace: true })
    } catch (err) {
      setError('İstifadəçi adı və ya şifrə yanlışdır.')
    } finally {
      setLoading(false)
    }
  }

  const fillDemo = (role) => {
    if (role === 'student') setForm({ username: 'ayten_student', password: 'student123' })
    else setForm({ username: 'ali_teacher', password: 'teacher123' })
  }

  return (
    <div className="login-page">
      <div className="login-bg">
        <div className="login-blob login-blob--1" />
        <div className="login-blob login-blob--2" />
      </div>

      <div className="login-card">
        <div className="login-logo">
          <span>🎓</span>
          <h1>UniPortal</h1>
          <p>Universitet İdarəetmə Sistemi</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">İstifadəçi adı</label>
            <input
              id="username"
              type="text"
              placeholder="username"
              value={form.username}
              onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
              required
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Şifrə</label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              required
              autoComplete="current-password"
            />
          </div>

          {error && <p className="login-error">{error}</p>}

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Giriş edilir...' : 'Daxil ol'}
          </button>
        </form>

        <div className="login-demo">
          <p>Demo hesablar:</p>
          <div className="demo-btns">
            <button onClick={() => fillDemo('student')}>🎒 Tələbə</button>
            <button onClick={() => fillDemo('teacher')}>📚 Müəllim</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
