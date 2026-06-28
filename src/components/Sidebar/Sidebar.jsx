import { NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import './Sidebar.css'

const studentLinks = [
  { to: '/student',         label: 'Dashboard',    icon: '⊞' },
  { to: '/student/profile', label: 'Profilim',     icon: '◉' },
  { to: '/student/exams',   label: 'İmtahanlar',   icon: '✎' },
]

const teacherLinks = [
  { to: '/teacher',         label: 'Dashboard',    icon: '⊞' },
]

const Sidebar = () => {
  const { user, logout } = useAuth()
  const links = user?.role === 'teacher' ? teacherLinks : studentLinks

  return (
    <aside className="sidebar">
      <div className="sidebar__logo">
        <span className="logo-icon">🎓</span>
        <span className="logo-text">UniPortal</span>
      </div>

      <nav className="sidebar__nav">
        {links.map(link => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/student' || link.to === '/teacher'}
            className={({ isActive }) => `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`}
          >
            <span className="sidebar__icon">{link.icon}</span>
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar__footer">
        <div className="sidebar__user">
          <div className="sidebar__avatar">
            {user?.first_name?.[0]}{user?.last_name?.[0]}
          </div>
          <div className="sidebar__user-info">
            <p className="sidebar__user-name">{user?.first_name} {user?.last_name}</p>
            <p className="sidebar__user-role">
              {user?.role === 'teacher' ? 'Müəllim' : 'Tələbə'}
            </p>
          </div>
        </div>
        <button className="sidebar__logout" onClick={logout} title="Çıxış">
          ⎋
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
