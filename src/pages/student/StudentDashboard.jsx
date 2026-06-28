import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'
import Spinner from '../../components/ui/Spinner'
import './StudentDashboard.css'

const AttBadge = ({ rate }) => {
  const cls = rate >= 75 ? 'good' : rate >= 50 ? 'warn' : 'bad'
  return <span className={`att-badge att-badge--${cls}`}>{rate}%</span>
}

const GradeBadge = ({ avg }) => {
  if (avg === null) return <span className="grade-badge grade-badge--none">—</span>
  const cls = avg >= 71 ? 'good' : avg >= 51 ? 'warn' : 'bad'
  const letter = avg >= 91 ? 'A' : avg >= 81 ? 'B' : avg >= 71 ? 'C' : avg >= 61 ? 'D' : avg >= 51 ? 'E' : 'F'
  return <span className={`grade-badge grade-badge--${cls}`}>{avg} ({letter})</span>
}

const StudentDashboard = () => {
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/university/student/subjects/')
      .then(res => setSubjects(res.data))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Spinner />

  const totalCredits = subjects.reduce((s, sub) => s + sub.credits, 0)
  const avgRate = subjects.length
    ? Math.round(subjects.reduce((s, sub) => s + (sub.attendance_summary?.rate || 0), 0) / subjects.length)
    : 0
  const grades = subjects.map(s => s.grade_summary?.average).filter(Boolean)
  const avgGrade = grades.length ? Math.round(grades.reduce((a, b) => a + b, 0) / grades.length) : null

  return (
    <div className="dashboard">
      {/* Stats */}
      <div className="stats-row">
        <div className="stat-card">
          <span className="stat-card__icon">📚</span>
          <div>
            <p className="stat-card__val">{subjects.length}</p>
            <p className="stat-card__label">Fənn</p>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-card__icon">🏆</span>
          <div>
            <p className="stat-card__val">{totalCredits}</p>
            <p className="stat-card__label">Kredit</p>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-card__icon">📅</span>
          <div>
            <p className="stat-card__val">{avgRate}%</p>
            <p className="stat-card__label">Davamiyyət</p>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-card__icon">⭐</span>
          <div>
            <p className="stat-card__val">{avgGrade ?? '—'}</p>
            <p className="stat-card__label">Orta bal</p>
          </div>
        </div>
      </div>

      {/* Subjects */}
      <h2 className="section-heading">Bu semestr fənlər</h2>

      {subjects.length === 0 ? (
        <div className="empty-state">Bu semestr üçün fənn tapılmadı.</div>
      ) : (
        <div className="subjects-grid">
          {subjects.map(sub => (
            <div className="subject-card" key={sub.id}>
              <div className="subject-card__header">
                <div>
                  <span className="subject-card__code">{sub.code}</span>
                  <h3 className="subject-card__name">{sub.name}</h3>
                </div>
                <span className="subject-card__credits">{sub.credits} kr</span>
              </div>

              <p className="subject-card__teacher">
                👤 {sub.teacher_info?.full_name ?? 'Müəllim yoxdur'}
              </p>

              <div className="subject-card__metrics">
                <div className="metric">
                  <span className="metric__label">Davamiyyət</span>
                  <AttBadge rate={sub.attendance_summary?.rate ?? 0} />
                </div>
                <div className="metric">
                  <span className="metric__label">Qayıb</span>
                  <span className="metric__val">{sub.attendance_summary?.absent ?? 0} dərs</span>
                </div>
                <div className="metric">
                  <span className="metric__label">Orta bal</span>
                  <GradeBadge avg={sub.grade_summary?.average ?? null} />
                </div>
              </div>

              {sub.upcoming_exams?.length > 0 && (
                <div className="subject-card__exams">
                  {sub.upcoming_exams.map(ex => (
                    <div key={ex.id} className="exam-pill">
                      <span>✎</span>
                      <span>{ex.title}</span>
                      <span className="exam-pill__date">
                        {new Date(ex.date).toLocaleDateString('az-AZ', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <Link
                to={`/student/attendance/${sub.id}`}
                className="subject-card__link"
              >
                Davamiyyətə bax →
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default StudentDashboard
