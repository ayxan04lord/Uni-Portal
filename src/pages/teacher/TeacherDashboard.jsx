import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'
import Spinner from '../../components/ui/Spinner'
import './TeacherDashboard.css'

const TeacherDashboard = () => {
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/university/teacher/subjects/')
      .then(res => setSubjects(res.data))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Spinner />

  const totalStudents = subjects.reduce((s, sub) => s + (sub.enrolled_count || 0), 0)

  return (
    <div className="teacher-dashboard">
      <div className="stats-row">
        <div className="stat-card">
          <span className="stat-card__icon">📚</span>
          <div>
            <p className="stat-card__val">{subjects.length}</p>
            <p className="stat-card__label">Fənn</p>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-card__icon">👥</span>
          <div>
            <p className="stat-card__val">{totalStudents}</p>
            <p className="stat-card__label">Ümumi tələbə</p>
          </div>
        </div>
      </div>

      <h2 className="section-heading">Fənlərim</h2>

      {subjects.length === 0 ? (
        <div className="empty-state">Sizə təyin edilmiş fənn yoxdur.</div>
      ) : (
        <div className="teacher-subjects">
          {subjects.map(sub => (
            <Link to={`/teacher/subject/${sub.id}`} key={sub.id} className="teacher-subject-card">
              <div className="tsc-header">
                <div>
                  <span className="tsc-code">{sub.code}</span>
                  <h3 className="tsc-name">{sub.name}</h3>
                </div>
                <span className="tsc-credits">{sub.credits} kredit</span>
              </div>
              <div className="tsc-meta">
                <span>📅 {sub.semester_name}</span>
                <span>👥 {sub.enrolled_count} tələbə</span>
              </div>
              <span className="tsc-arrow">Tələbələrə bax →</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default TeacherDashboard
