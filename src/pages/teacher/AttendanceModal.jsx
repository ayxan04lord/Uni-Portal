import { useState } from 'react'
import api from '../../api/axios'
import './Modal.css'

const STATUS_OPTIONS = [
  { value: 'present', label: '✓ İştirak' },
  { value: 'absent',  label: '✗ Qayıb'   },
  { value: 'late',    label: '⏰ Gecikdi' },
  { value: 'excused', label: '📋 Üzürlü' },
]

const AttendanceModal = ({ subjectId, enrollments, onClose, onSave }) => {
  const today = new Date().toISOString().split('T')[0]
  const [date, setDate] = useState(today)
  const [records, setRecords] = useState(
    enrollments.map(enr => ({ enrollment_id: enr.id, status: 'present', note: '' }))
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const setStatus = (enrollmentId, status) => {
    setRecords(r => r.map(rec =>
      rec.enrollment_id === enrollmentId ? { ...rec, status } : rec
    ))
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')
    try {
      await api.post(`/university/teacher/subjects/${subjectId}/attendance/`, { date, records })
      onSave()
    } catch (err) {
      setError(err.response?.data?.detail || 'Xəta baş verdi.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal__header">
          <h2>📅 Davamiyyət yaz</h2>
          <button className="modal__close" onClick={onClose}>×</button>
        </div>

        <div className="modal__body">
          <div className="form-group">
            <label>Tarix</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} max={today} />
          </div>

          <div className="att-list">
            {enrollments.map((enr, i) => {
              const rec = records[i]
              return (
                <div key={enr.id} className="att-row">
                  <div className="att-row__student">
                    <div className="att-avatar">
                      {enr.student_info.full_name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                    </div>
                    <span>{enr.student_info.full_name}</span>
                  </div>
                  <div className="att-row__btns">
                    {STATUS_OPTIONS.map(opt => (
                      <button
                        key={opt.value}
                        className={`att-opt ${rec.status === opt.value ? `att-opt--active att-opt--${opt.value}` : ''}`}
                        onClick={() => setStatus(enr.id, opt.value)}
                        type="button"
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>

          {error && <p className="modal-error">{error}</p>}
        </div>

        <div className="modal__footer">
          <button className="modal-btn modal-btn--cancel" onClick={onClose}>Ləğv et</button>
          <button className="modal-btn modal-btn--save" onClick={handleSave} disabled={saving}>
            {saving ? 'Saxlanır...' : 'Saxla'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default AttendanceModal
