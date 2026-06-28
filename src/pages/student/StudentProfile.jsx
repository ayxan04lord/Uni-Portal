import { useEffect, useState } from 'react'
import api from '../../api/axios'
import Spinner from '../../components/ui/Spinner'
import './StudentProfile.css'

const letterColor = { A:'#34d399', B:'#60a5fa', C:'#a78bfa', D:'#f59e0b', E:'#fb923c', F:'#f87171' }

const StudentProfile = () => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/university/student/profile/')
      .then(res => setData(res.data))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Spinner />
  if (!data) return <div className="empty-state">Məlumat tapılmadı.</div>

  return (
    <div className="profile-page">
      {/* Overview */}
      <div className="profile-overview">
        <div className="overview-item">
          <p className="overview-val">{data.overall_average ?? '—'}</p>
          <p className="overview-label">Ümumi orta bal</p>
        </div>
        <div className="overview-divider" />
        <div className="overview-item">
          <p className="overview-val">{data.gpa_4 ?? '—'}</p>
          <p className="overview-label">GPA (4.0)</p>
        </div>
        <div className="overview-divider" />
        <div className="overview-item">
          <p className="overview-val">{data.earned_credits}/{data.total_credits}</p>
          <p className="overview-label">Qazanılan kredit</p>
        </div>
      </div>

      {/* Semestr detalları */}
      {data.semesters.map((sem, i) => (
        <div className="sem-block" key={i}>
          <h2 className="sem-title">{sem.semester}</h2>
          <div className="sem-table-wrap">
            <table className="sem-table">
              <thead>
                <tr>
                  <th>Fənn</th>
                  <th>Kredit</th>
                  <th>Orta bal</th>
                  <th>Hərfi qiymət</th>
                  <th>Davamiyyət</th>
                </tr>
              </thead>
              <tbody>
                {sem.subjects.map((sub, j) => (
                  <tr key={j}>
                    <td>
                      <span className="sub-code">{sub.subject_code}</span>
                      <span className="sub-name"> {sub.subject_name}</span>
                    </td>
                    <td>{sub.credits}</td>
                    <td>
                      <span className="score-val">{sub.average ?? '—'}</span>
                    </td>
                    <td>
                      <span
                        className="letter-badge"
                        style={{ color: letterColor[sub.letter] || 'var(--text-muted)' }}
                      >
                        {sub.letter}
                      </span>
                    </td>
                    <td>
                      <span className={`att-pill ${
                        sub.attendance_rate >= 75 ? 'good' :
                        sub.attendance_rate >= 50 ? 'warn' : 'bad'
                      }`}>
                        {sub.attendance_rate}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      {data.semesters.length === 0 && (
        <div className="empty-state">Heç bir semestr məlumatı yoxdur.</div>
      )}
    </div>
  )
}

export default StudentProfile
