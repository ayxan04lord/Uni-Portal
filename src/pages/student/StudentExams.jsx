import { useEffect, useState } from 'react'
import api from '../../api/axios'
import Spinner from '../../components/ui/Spinner'
import './StudentExams.css'

const typeColor = { midterm:'#7c6af7', final:'#f472b6', quiz:'#34d399', makeup:'#f59e0b' }
const statusMap = {
  scheduled: { label: 'Planlaşdırılıb', cls: 'scheduled' },
  ongoing:   { label: 'Davam edir',     cls: 'ongoing'   },
  completed: { label: 'Tamamlandı',     cls: 'completed' },
  cancelled: { label: 'Ləğv edildi',    cls: 'cancelled' },
}

const StudentExams = () => {
  const [exams, setExams] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/university/student/exams/')
      .then(res => setExams(res.data))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Spinner />

  const upcoming  = exams.filter(e => e.status === 'scheduled')
  const past      = exams.filter(e => e.status !== 'scheduled')

  return (
    <div className="exams-page">
      <section>
        <h2 className="section-heading">Gözləyən imtahanlar ({upcoming.length})</h2>
        {upcoming.length === 0
          ? <div className="empty-state">Planlaşdırılmış imtahan yoxdur 🎉</div>
          : <div className="exams-grid">
              {upcoming.map(ex => <ExamCard key={ex.id} exam={ex} />)}
            </div>
        }
      </section>

      {past.length > 0 && (
        <section>
          <h2 className="section-heading">Keçmiş imtahanlar</h2>
          <div className="exams-grid">
            {past.map(ex => <ExamCard key={ex.id} exam={ex} />)}
          </div>
        </section>
      )}
    </div>
  )
}

const ExamCard = ({ exam }) => {
  const d = new Date(exam.date)
  const daysLeft = Math.ceil((d - new Date()) / (1000 * 60 * 60 * 24))
  const s = statusMap[exam.status] || { label: exam.status, cls: '' }

  return (
    <div className="exam-card" style={{ '--ec': typeColor[exam.exam_type] || '#7c6af7' }}>
      <div className="exam-card__top">
        <div>
          <span className="exam-card__code">{exam.subject_code}</span>
          <h3 className="exam-card__title">{exam.title}</h3>
        </div>
        <span className={`exam-status exam-status--${s.cls}`}>{s.label}</span>
      </div>

      <div className="exam-card__info">
        <span>📅 {d.toLocaleDateString('az-AZ', { day:'numeric', month:'long', year:'numeric' })}</span>
        <span>🕐 {d.toLocaleTimeString('az-AZ', { hour:'2-digit', minute:'2-digit' })}</span>
        {exam.location && <span>📍 {exam.location}</span>}
        <span>⏱ {exam.duration_minutes} dəq</span>
        <span>📊 Maks bal: {exam.max_score}</span>
      </div>

      {exam.status === 'scheduled' && daysLeft > 0 && (
        <div className={`exam-countdown ${daysLeft <= 3 ? 'urgent' : ''}`}>
          {daysLeft === 1 ? '⚠️ Sabah!' : `${daysLeft} gün qaldı`}
        </div>
      )}

      {exam.description && (
        <p className="exam-card__desc">{exam.description}</p>
      )}
    </div>
  )
}

export default StudentExams
