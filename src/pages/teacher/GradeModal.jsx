import { useState } from 'react'
import api from '../../api/axios'
import './Modal.css'

const GRADE_TYPES = [
  { value: 'quiz',     label: 'Test' },
  { value: 'homework', label: 'Ev tapşırığı' },
  { value: 'midterm',  label: 'Aralıq imtahan' },
  { value: 'final',    label: 'Final imtahan' },
  { value: 'activity', label: 'Fəallıq' },
]

const GradeModal = ({ enrollment, onClose, onSave }) => {
  const [form, setForm] = useState({
    grade_type: 'quiz',
    score: '',
    max_score: '100',
    description: '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSave = async () => {
    if (!form.score) { setError('Bal daxil edin.'); return }
    setSaving(true)
    setError('')
    try {
      await api.post('/university/teacher/grades/', {
        enrollment: enrollment.id,
        grade_type: form.grade_type,
        score: parseFloat(form.score),
        max_score: parseFloat(form.max_score),
        description: form.description,
      })
      onSave()
    } catch (err) {
      const d = err.response?.data
      setError(typeof d === 'object' ? JSON.stringify(d) : 'Xəta baş verdi.')
    } finally {
      setSaving(false)
    }
  }

  const pct = form.score && form.max_score
    ? Math.round(parseFloat(form.score) / parseFloat(form.max_score) * 100)
    : null

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal modal--sm">
        <div className="modal__header">
          <h2>⭐ Bal yaz — {enrollment.student_info.full_name}</h2>
          <button className="modal__close" onClick={onClose}>×</button>
        </div>

        <div className="modal__body">
          <div className="form-group">
            <label>Qiymət növü</label>
            <select value={form.grade_type} onChange={e => setForm(f => ({ ...f, grade_type: e.target.value }))}>
              {GRADE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Bal</label>
              <input type="number" min="0" max={form.max_score} step="0.5"
                value={form.score} onChange={e => setForm(f => ({ ...f, score: e.target.value }))} />
            </div>
            <div className="form-group">
              <label>Maks bal</label>
              <input type="number" min="1" step="1"
                value={form.max_score} onChange={e => setForm(f => ({ ...f, max_score: e.target.value }))} />
            </div>
          </div>

          {pct !== null && (
            <div className="grade-preview">
              <div className="grade-preview__bar">
                <div className="grade-preview__fill" style={{
                  width: `${pct}%`,
                  background: pct >= 71 ? '#34d399' : pct >= 51 ? '#f59e0b' : '#f87171'
                }} />
              </div>
              <span className="grade-preview__pct">{pct}%</span>
            </div>
          )}

          <div className="form-group">
            <label>Qeyd (isteğe bağlı)</label>
            <input type="text" placeholder="məs: midterm 1..."
              value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
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

export default GradeModal
