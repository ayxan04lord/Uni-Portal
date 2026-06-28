import { useState } from 'react'
import api from '../../api/axios'
import './Modal.css'

// datetime-local input üçün format: "2025-06-28T14:30"
const toDatetimeLocal = (isoString) => {
  if (!isoString) return ''
  // Backend UTC qaytarır, local vaxta çeviririk
  const d = new Date(isoString)
  const pad = n => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

const STATUS_OPTIONS = [
  { value: 'scheduled', label: '📅 Planlaşdırılıb' },
  { value: 'ongoing',   label: '▶ Davam edir'      },
  { value: 'completed', label: '✓ Tamamlandı'      },
  { value: 'cancelled', label: '✗ Ləğv edildi'     },
]

/**
 * exam prop varsa — edit rejimi (PATCH)
 * yoxdursa     — yeni əlavə rejimi (POST)
 */
const ExamModal = ({ subjectId, exam, onClose, onSave }) => {
  const isEdit = Boolean(exam)

  const [form, setForm] = useState({
    title:            exam?.title            ?? '',
    exam_type:        exam?.exam_type        ?? 'quiz',
    date:             toDatetimeLocal(exam?.date),
    duration_minutes: exam?.duration_minutes ?? 90,
    location:         exam?.location         ?? '',
    max_score:        exam?.max_score        ?? 100,
    description:      exam?.description      ?? '',
    status:           exam?.status           ?? 'scheduled',
  })
  const [saving, setSaving]   = useState(false)
  const [error,  setError]    = useState('')

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = async () => {
    if (!form.title || !form.date) { setError('Başlıq və tarix mütləqdir.'); return }
    setSaving(true)
    setError('')

    const payload = {
      subject:          parseInt(subjectId),
      title:            form.title,
      exam_type:        form.exam_type,
      date:             form.date,           // ISO string kimi göndər
      duration_minutes: parseInt(form.duration_minutes),
      location:         form.location,
      max_score:        parseFloat(form.max_score),
      description:      form.description,
      status:           form.status,
    }

    try {
      if (isEdit) {
        await api.patch(`/university/teacher/exams/${exam.id}/`, payload)
      } else {
        await api.post('/university/teacher/exams/', payload)
      }
      onSave()
    } catch (err) {
      const d = err.response?.data
      setError(typeof d === 'object' ? JSON.stringify(d) : 'Xəta baş verdi.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal modal--sm">

        <div className="modal__header">
          <h2>{isEdit ? '✏️ İmtahanı düzəlt' : '✎ İmtahan əlavə et'}</h2>
          <button className="modal__close" onClick={onClose}>×</button>
        </div>

        <div className="modal__body">

          {/* Başlıq */}
          <div className="form-group">
            <label>Başlıq</label>
            <input
              type="text"
              placeholder="məs: Aralıq İmtahan 1"
              value={form.title}
              onChange={e => set('title', e.target.value)}
            />
          </div>

          {/* Növ + Maks bal */}
          <div className="form-row">
            <div className="form-group">
              <label>Növ</label>
              <select value={form.exam_type} onChange={e => set('exam_type', e.target.value)}>
                <option value="quiz">Test</option>
                <option value="midterm">Aralıq</option>
                <option value="final">Final</option>
                <option value="makeup">Əlavə</option>
              </select>
            </div>
            <div className="form-group">
              <label>Maks bal</label>
              <input
                type="number"
                min="1"
                value={form.max_score}
                onChange={e => set('max_score', e.target.value)}
              />
            </div>
          </div>

          {/* Tarix + Müddət */}
          <div className="form-row">
            <div className="form-group">
              <label>Tarix və saat</label>
              <input
                type="datetime-local"
                value={form.date}
                onChange={e => set('date', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Müddət (dəq)</label>
              <input
                type="number"
                min="10"
                value={form.duration_minutes}
                onChange={e => set('duration_minutes', e.target.value)}
              />
            </div>
          </div>

          {/* Yer */}
          <div className="form-group">
            <label>Otaq / yer</label>
            <input
              type="text"
              placeholder="məs: Otaq 203"
              value={form.location}
              onChange={e => set('location', e.target.value)}
            />
          </div>

          {/* Status — yalnız edit rejimində görünür */}
          {isEdit && (
            <div className="form-group">
              <label>Status</label>
              <div className="status-options">
                {STATUS_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    className={`status-opt status-opt--${opt.value} ${form.status === opt.value ? 'status-opt--active' : ''}`}
                    onClick={() => set('status', opt.value)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Açıqlama */}
          <div className="form-group">
            <label>Açıqlama (isteğe bağlı)</label>
            <textarea
              rows="2"
              placeholder="İmtahan haqqında qeyd..."
              value={form.description}
              onChange={e => set('description', e.target.value)}
            />
          </div>

          {error && <p className="modal-error">{error}</p>}
        </div>

        <div className="modal__footer">
          <button className="modal-btn modal-btn--cancel" onClick={onClose}>Ləğv et</button>
          <button className="modal-btn modal-btn--save" onClick={handleSave} disabled={saving}>
            {saving ? 'Saxlanır...' : isEdit ? 'Yenilə' : 'Əlavə et'}
          </button>
        </div>

      </div>
    </div>
  )
}

export default ExamModal
