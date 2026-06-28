import { useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import './Topbar.css'

const titles = {
  '/student':            'Dashboard',
  '/student/profile':    'Akademik Profil',
  '/student/exams':      'İmtahanlar',
  '/teacher':            'Dashboard',
}

const Topbar = () => {
  const { pathname } = useLocation()
  const { user } = useAuth()

  const title = titles[pathname] ||
    (pathname.startsWith('/teacher/subject') ? 'Fənn Detalları' : 'UniPortal')

  const now = new Date()
  const dateStr = now.toLocaleDateString('az-AZ', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  })

  return (
    <header className="topbar">
      <div className="topbar__left">
        <h1 className="topbar__title">{title}</h1>
        <p className="topbar__date">{dateStr}</p>
      </div>
      <div className="topbar__right">
        <div className="topbar__greeting">
          Salam, <strong>{user?.first_name}</strong> 👋
        </div>
      </div>
    </header>
  )
}

export default Topbar
