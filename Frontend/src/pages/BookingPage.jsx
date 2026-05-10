import { useState, useEffect } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { getExpert, createBooking } from '../api/index.js'
import { Avatar } from '../components/ExpertCard.jsx'
import { ErrorState } from '../components/LoadingStates.jsx'

/* ── Validation ── */
function validate(fields) {
  const errors = {}

  if (!fields.name.trim()) errors.name = 'Full name is required'
  else if (fields.name.trim().length < 2) errors.name = 'Name must be at least 2 characters'

  if (!fields.email.trim()) errors.email = 'Email is required'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email))
    errors.email = 'Please enter a valid email'

  if (!fields.phone.trim()) errors.phone = 'Phone number is required'
  else if (!/^[6-9]\d{9}$/.test(fields.phone.replace(/\s|-/g, '')))
    errors.phone = 'Enter a valid 10-digit Indian mobile number'

  if (!fields.date) errors.date = 'Please select a date'
  else {
    const selected = new Date(fields.date)
    const today = new Date(); today.setHours(0, 0, 0, 0)
    if (selected < today) errors.date = 'Please select a future date'
  }

  if (!fields.timeSlot) errors.timeSlot = 'Please select a time slot'

  return errors
}

/* ── Helpers ── */
function groupSlotsByDate(slots = []) {
  const map = {}
  slots.forEach((s) => {
    if (s.isBooked) return
    const dk = s.date?.slice(0, 10)
    if (!dk) return
    if (!map[dk]) map[dk] = []
    map[dk].push(s)
  })
  return map
}

function formatDateLabel(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
}

export default function BookingPage() {
  const { expertId } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const [expert, setExpert] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  const [fields, setFields] = useState({
    name: '',
    email: '',
    phone: '',
    date: searchParams.get('date') || '',
    timeSlot: searchParams.get('slot') || '',
    notes: '',
  })
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})

  useEffect(() => {
    getExpert(expertId)
      .then(setExpert)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [expertId])

  const slotsMap = groupSlotsByDate(expert?.availableSlots)
  const availableDates = Object.keys(slotsMap).sort()
  const timeSlotsForDate = fields.date ? (slotsMap[fields.date] || []) : []

  function set(key, value) {
    setFields((f) => ({ ...f, [key]: value }))
    if (touched[key]) {
      const newErrors = validate({ ...fields, [key]: value })
      setErrors((e) => ({ ...e, [key]: newErrors[key] }))
    }
  }

  function blur(key) {
    setTouched((t) => ({ ...t, [key]: true }))
    const newErrors = validate(fields)
    setErrors((e) => ({ ...e, [key]: newErrors[key] }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setTouched({ name: true, email: true, phone: true, date: true, timeSlot: true })
    const errs = validate(fields)
    setErrors(errs)
    if (Object.keys(errs).length > 0) return

    setSubmitting(true)
    try {
      await createBooking({
        expertId,
        name: fields.name.trim(),
        email: fields.email.trim().toLowerCase(),
        phone: fields.phone.trim(),
        date: fields.date,
        timeSlot: fields.timeSlot,
        notes: fields.notes.trim(),
      })
      setSuccess(true)
      toast.success('Booking confirmed!')
    } catch (err) {
      if (err.message.includes('409') || err.message.toLowerCase().includes('already booked')) {
        setErrors({ timeSlot: 'This slot was just booked by someone else. Please choose another.' })
      } else {
        toast.error(err.message || 'Booking failed. Please try again.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return (
    <div className="container" style={{ paddingTop: 80, textAlign: 'center' }}>
      <div style={{ color: 'var(--text-muted)' }}>Loading…</div>
    </div>
  )
  if (error) return (
    <div className="container" style={{ paddingTop: 48 }}>
      <ErrorState message={error} />
    </div>
  )

  if (success) return (
    <div style={{ padding: '80px 24px', textAlign: 'center' }}>
      <div style={{
        width: 72,
        height: 72,
        borderRadius: '50%',
        background: 'var(--accent-light)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 24px',
        fontSize: 32,
      }}>
        ✓
      </div>
      <h1 style={{
        fontFamily: 'var(--font-display)',
        fontSize: 32,
        fontWeight: 400,
        marginBottom: 12,
        color: 'var(--text-primary)',
      }}>
        Booking confirmed!
      </h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 8 }}>
        Your session with <strong>{expert?.name}</strong> is pending confirmation.
      </p>
      <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 36 }}>
        A confirmation has been sent to <strong>{fields.email}</strong>
      </p>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
        <button className="btn btn-primary" onClick={() => navigate('/my-bookings')}>
          View my bookings
        </button>
        <button className="btn btn-outline" onClick={() => navigate('/')}>
          Browse more experts
        </button>
      </div>
    </div>
  )

  return (
    <div style={{ padding: '40px 0 80px' }}>
      <div className="container" style={{ maxWidth: 720 }}>
        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="btn btn-ghost"
          style={{ marginBottom: 24, paddingLeft: 0 }}
        >
          ← Back
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 24 }}>
          {/* Expert info strip */}
          {expert && (
            <div
              className="card"
              style={{
                padding: '20px 24px',
                display: 'flex',
                alignItems: 'center',
                gap: 16,
              }}
            >
              <Avatar name={expert.name} size={52} />
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
                  Booking session with
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 400 }}>
                  {expert.name}
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{expert.category}</div>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate>
            <div className="card" style={{ padding: '28px 28px' }}>
              <h2 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 22,
                fontWeight: 400,
                marginBottom: 24,
              }}>
                Your details
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <Field label="Full name" error={touched.name && errors.name}>
                  <input
                    className={`form-input${touched.name && errors.name ? ' error' : ''}`}
                    type="text"
                    placeholder="Aarav Sharma"
                    value={fields.name}
                    onChange={(e) => set('name', e.target.value)}
                    onBlur={() => blur('name')}
                    autoComplete="name"
                  />
                </Field>
                <Field label="Email" error={touched.email && errors.email}>
                  <input
                    className={`form-input${touched.email && errors.email ? ' error' : ''}`}
                    type="email"
                    placeholder="aarav@email.com"
                    value={fields.email}
                    onChange={(e) => set('email', e.target.value)}
                    onBlur={() => blur('email')}
                    autoComplete="email"
                  />
                </Field>
              </div>

              <div style={{ marginBottom: 16 }}>
                <Field label="Phone number" error={touched.phone && errors.phone}>
                  <input
                    className={`form-input${touched.phone && errors.phone ? ' error' : ''}`}
                    type="tel"
                    placeholder="98XXXXXXXX"
                    value={fields.phone}
                    onChange={(e) => set('phone', e.target.value)}
                    onBlur={() => blur('phone')}
                    autoComplete="tel"
                    maxLength={10}
                  />
                </Field>
              </div>

              <div className="divider" />

              <h2 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 22,
                fontWeight: 400,
                marginBottom: 20,
              }}>
                Choose a slot
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <Field label="Date" error={touched.date && errors.date}>
                  <select
                    className={`form-input${touched.date && errors.date ? ' error' : ''}`}
                    value={fields.date}
                    onChange={(e) => { set('date', e.target.value); set('timeSlot', '') }}
                    onBlur={() => blur('date')}
                  >
                    <option value="">Select a date</option>
                    {availableDates.map((d) => (
                      <option key={d} value={d}>{formatDateLabel(d)}</option>
                    ))}
                  </select>
                </Field>

                <Field label="Time slot" error={touched.timeSlot && errors.timeSlot}>
                  <select
                    className={`form-input${touched.timeSlot && errors.timeSlot ? ' error' : ''}`}
                    value={fields.timeSlot}
                    onChange={(e) => set('timeSlot', e.target.value)}
                    onBlur={() => blur('timeSlot')}
                    disabled={!fields.date}
                  >
                    <option value="">
                      {!fields.date
                        ? 'Select a date first'
                        : timeSlotsForDate.length === 0
                        ? 'No slots on this date'
                        : 'Select a time'}
                    </option>
                    {timeSlotsForDate.map((s) => (
                      <option key={s._id || s.time} value={s.time}>
                        {s.time}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              <div style={{ marginBottom: 24 }}>
                <Field label="Notes (optional)">
                  <textarea
                    className="form-input"
                    placeholder="What would you like to discuss?"
                    value={fields.notes}
                    onChange={(e) => set('notes', e.target.value)}
                    rows={3}
                    style={{ resize: 'vertical', minHeight: 80 }}
                  />
                </Field>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting}
                style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
              >
                {submitting ? 'Confirming booking…' : 'Confirm booking'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

function Field({ label, error, children }) {
  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      {children}
      {error && (
        <span className="form-error">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <circle cx="6" cy="6" r="5.5" stroke="currentColor"/>
            <path d="M6 3.5v3M6 8v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          {error}
        </span>
      )}
    </div>
  )
}
