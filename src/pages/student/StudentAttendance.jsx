import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../../api/axios'
import Spinner from '../../components/ui/Spinner'
import './StudentAttendance.css'

const statusMap = {
  present: { label: 'İştirak',   cls: 'present' },
  absent:  { label: 'Qayıb',     cls: 'absent'  },
  late:    { label: 'Gecikdi',   cls: 'late'    },
  excused: { label: 'Üzürlü',   cls: 'excused' },
}

const StudentAttendance = () => {
  const { subjectId } = useParams()
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(`/university/student/subjects/${subjectId}/attendance/`)
      .then(res => setRecords(res.data))
      .finally(() => setLoading(false))
  }, [subjectId])

  if (loading) return <Spinner />

  const total   = records.length
  const present = records.filter(r => r.status === 'present').length
  const absent  = records.filter(r => r.status === 'absent').length
  const late    = records.filter(r => r.status === 'late').length
  const excused = records.filter(r => r.status === 'excused').length
  const rate    = total ? Math.round((present + late) / total * 100) : 0

  return (
    <div className="attendance-page">
      <Link to="/student" className="back-link">← Geri</Link>

      <div className="att-summary">
        <div className={`att-circle ${rate >= 75 ? 'good' : rate >= 50 ? 'warn' : 'bad'}`}>
          <span className="att-circle__val">{rate}%</span>
          <span className="att-circle__label">Davamiyyət</span>
        </div>
        <div className="att-stats">
          <div className="att-stat att-stat--present">✓ İştirak: <b>{present}</b></div>
          <div className="att-stat att-stat--absent">✗ Qayıb: <b>{absent}</b></div>
          <div className="att-stat att-stat--late">⏰ Gecikdi: <b>{late}</b></div>
          <div className="att-stat att-stat--excused">📋 Üzürlü: <b>{excused}</b></div>
          <div className="att-stat">📊 Cəmi: <b>{total}</b></div>
        </div>
      </div>

      {records.length === 0 ? (
        <div className="empty-state">Davamiyyət qeydi yoxdur.</div>
      ) : (
        <div className="att-table-wrap">
          <table className="att-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Tarix</th>
                <th>Status</th>
                <th>Qeyd</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r, i) => {
                const s = statusMap[r.status] || { label: r.status, cls: '' }
                return (
                  <tr key={r.id}>
                    <td>{i + 1}</td>
                    <td>{new Date(r.date).toLocaleDateString('az-AZ', {
                      day: 'numeric', month: 'long', year: 'numeric'
                    })}</td>
                    <td>
                      <span className={`status-pill status-pill--${s.cls}`}>{s.label}</span>
                    </td>
                    <td className="att-note">{r.note || '—'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default StudentAttendance
