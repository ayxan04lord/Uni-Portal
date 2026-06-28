import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../../api/axios'
import Spinner from '../../components/ui/Spinner'
import AttendanceModal from './AttendanceModal'
import GradeModal from './GradeModal'
import ExamModal from './ExamModal'
import './TeacherSubject.css'

const TeacherSubject = () => {
  const { subjectId } = useParams()
  const [data, setData] = useState(null)
  const [exams, setExams] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null) // 'attendance' | 'grade' | 'exam' | 'exam-edit'
  const [selectedEnrollment, setSelectedEnrollment] = useState(null)
  const [selectedExam, setSelectedExam] = useState(null)
  const [activeTab, setActiveTab] = useState('students') // 'students' | 'exams'

  const fetchData = () => {
    Promise.all([
      api.get(`/university/teacher/subjects/${subjectId}/students/`),
      api.get(`/university/subjects/${subjectId}/exams/`)
    ]).then(([studRes, examRes]) => {
      setData(studRes.data)
      setExams(examRes.data)
    }).finally(() => setLoading(false))
  }

  useEffect(() => { fetchData() }, [subjectId])

  if (loading) return <Spinner />
  if (!data) return <div className="empty-state">Məlumat tapılmadı.</div>

  const { subject, enrollments } = data

  return (
    <div className="teacher-subject">
      <Link to="/teacher" className="back-link">← Geri</Link>

      <div className="subject-header">
        <div>
          <span className="subject-code">{subject.code}</span>
          <h1 className="subject-title">{subject.name}</h1>
          <p className="subject-meta">{subject.semester_name} · {subject.credits} kredit · {enrollments.length} tələbə</p>
        </div>
        <div className="subject-actions">
          <button className="action-btn action-btn--att"
            onClick={() => { setModal('attendance') }}>
            📅 Davamiyyət yaz
          </button>
          <button className="action-btn action-btn--exam"
            onClick={() => setModal('exam')}>
            ✎ İmtahan əlavə et
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button className={`tab ${activeTab === 'students' ? 'tab--active' : ''}`}
          onClick={() => setActiveTab('students')}>
          👥 Tələbələr ({enrollments.length})
        </button>
        <button className={`tab ${activeTab === 'exams' ? 'tab--active' : ''}`}
          onClick={() => setActiveTab('exams')}>
          ✎ İmtahanlar ({exams.length})
        </button>
      </div>

      {/* Students tab */}
      {activeTab === 'students' && (
        <div className="students-table-wrap">
          <table className="students-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Tələbə</th>
                <th>Davamiyyət</th>
                <th>Qayıb</th>
                <th>Orta bal</th>
                <th>Əməliyyatlar</th>
              </tr>
            </thead>
            <tbody>
              {enrollments.map((enr, i) => (
                <tr key={enr.id}>
                  <td>{i + 1}</td>
                  <td>
                    <div className="student-cell">
                      <div className="student-avatar">
                        {enr.student_info.full_name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <p className="student-name">{enr.student_info.full_name}</p>
                        <p className="student-username">@{enr.student_info.username}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`att-pill ${
                      (enr.attendance_summary?.rate ?? 0) >= 75 ? 'good' :
                      (enr.attendance_summary?.rate ?? 0) >= 50 ? 'warn' : 'bad'
                    }`}>
                      {enr.attendance_summary?.rate ?? 0}%
                    </span>
                  </td>
                  <td className="absent-cell">{enr.attendance_summary?.absent ?? 0}</td>
                  <td>
                    <span className={`score-pill ${
                      enr.average >= 71 ? 'good' : enr.average >= 51 ? 'warn' : enr.average ? 'bad' : 'none'
                    }`}>
                      {enr.average ?? '—'}
                    </span>
                  </td>
                  <td>
                    <button className="mini-btn" onClick={() => {
                      setSelectedEnrollment(enr)
                      setModal('grade')
                    }}>
                      + Bal
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Exams tab */}
      {activeTab === 'exams' && (
        <div className="exams-list">
          {exams.length === 0 ? (
            <div className="empty-state">İmtahan yoxdur. Yuxarıdan əlavə edin.</div>
          ) : (
            exams.map(ex => (
              <div key={ex.id} className="exam-row">
                <div className="exam-row__info">
                  <p className="exam-row__title">{ex.title}</p>
                  <p className="exam-row__meta">
                    {new Date(ex.date).toLocaleString('az-AZ')} · {ex.location || 'Yer yoxdur'} · {ex.duration_minutes} dəq · Maks: {ex.max_score}
                  </p>
                </div>
                <div className="exam-row__right">
                  <span className={`exam-status exam-status--${ex.status}`}>
                    {ex.status_display}
                  </span>
                  <button
                    className="mini-btn"
                    onClick={() => { setSelectedExam(ex); setModal('exam-edit') }}
                  >
                    ✏️ Düzəlt
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Modals */}
      {modal === 'attendance' && (
        <AttendanceModal
          subjectId={subjectId}
          enrollments={enrollments}
          onClose={() => setModal(null)}
          onSave={() => { setModal(null); fetchData() }}
        />
      )}
      {modal === 'grade' && selectedEnrollment && (
        <GradeModal
          enrollment={selectedEnrollment}
          onClose={() => { setModal(null); setSelectedEnrollment(null) }}
          onSave={() => { setModal(null); setSelectedEnrollment(null); fetchData() }}
        />
      )}
      {modal === 'exam' && (
        <ExamModal
          subjectId={subjectId}
          onClose={() => setModal(null)}
          onSave={() => { setModal(null); fetchData() }}
        />
      )}
      {modal === 'exam-edit' && selectedExam && (
        <ExamModal
          subjectId={subjectId}
          exam={selectedExam}
          onClose={() => { setModal(null); setSelectedExam(null) }}
          onSave={() => { setModal(null); setSelectedExam(null); fetchData() }}
        />
      )}
    </div>
  )
}

export default TeacherSubject
