import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMyBookings } from '../api/index.js'
import { ErrorState } from '../components/LoadingStates.jsx'

const STATUS_CONFIG = {
  pending: { label: 'Pending', className: 'badge badge-pending', dot: '#c47d1a' },
  confirmed: { label: 'Confirmed', className: 'badge badge-confirmed', dot: '#2d5a3d' },
  completed: { label: 'Completed', className: 'badge badge-completed', dot: '#9a968e' },
}

function formatDateTime(dateStr, timeSlot) {
  const d = new Date(dateStr + 'T00:00:00')
  const date = d.toLocaleDateString('en-IN', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
  })
  return `${date} · ${timeSlot}`
}

export default function MyBookingsPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [submittedEmail, setSubmittedEmail] = useState('')
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [searched, setSearched] = useState(false)

  async function handleSearch(e) {
    e.preventDefault()
    const trimmed = email.trim()
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return

    setLoading(true)
    setError(null)
    setSearched(false)

    try {
      const data = await getMyBookings(trimmed)
      setBookings(Array.isArray(data) ? data : data.bookings || [])
      setSubmittedEmail(trimmed)
      setSearched(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const pending = bookings.filter((b) => b.status === 'pending')
  const confirmed = bookings.filter((b) => b.status === 'confirmed')
  const completed = bookings.filter((b) => b.status === 'completed')

  return (
    <div style={{ padding: '48px 0 80px' }}>
      <div className="container" style={{ maxWidth: 760 }}>
        {/* Header */}
        <div style={{ marginBottom: 36 }}>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 36,
            fontWeight: 400,
            letterSpacing: '-0.02em',
            marginBottom: 8,
          }}>
            My bookings
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>
            Enter your email to view your session history.
          </p>
        </div>

        {/* Email lookup form */}
        <form onSubmit={handleSearch}>
          <div style={{
            display: 'flex',
            gap: 10,
            marginBottom: 40,
          }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <svg
                style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }}
                width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              >
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              <input
                className="form-input"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ paddingLeft: 42 }}
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ minWidth: 120, justifyContent: 'center' }}
            >
              {loading ? 'Searching…' : 'Look up'}
            </button>
          </div>
        </form>

        {/* Error */}
        {error && <ErrorState message={error} />}

        {/* Results */}
        {searched && !error && (
          <>
            {/* Summary chips */}
            {bookings.length > 0 && (
              <div style={{ display: 'flex', gap: 10, marginBottom: 28, flexWrap: 'wrap' }}>
                <SummaryChip label="Total" count={bookings.length} />
                {pending.length > 0 && <SummaryChip label="Pending" count={pending.length} color="#c47d1a" bg="#fdf3e0" />}
                {confirmed.length > 0 && <SummaryChip label="Confirmed" count={confirmed.length} color="#2d5a3d" bg="#e8f2eb" />}
                {completed.length > 0 && <SummaryChip label="Completed" count={completed.length} color="#5a564f" bg="#ede9e3" />}
              </div>
            )}

            {bookings.length === 0 ? (
              <div className="empty-state">
                <h3>No bookings found</h3>
                <p style={{ fontSize: 14, marginTop: 6 }}>
                  No sessions found for <strong>{submittedEmail}</strong>
                </p>
                <button
                  className="btn btn-primary"
                  onClick={() => navigate('/')}
                  style={{ marginTop: 20 }}
                >
                  Browse experts
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {/* Sort: pending first, then confirmed, then completed */}
                {[...pending, ...confirmed, ...completed].map((booking) => (
                  <BookingRow key={booking._id} booking={booking} />
                ))}
              </div>
            )}
          </>
        )}

        {/* Prompt to browse if not searched yet */}
        {!searched && !loading && (
          <div style={{ textAlign: 'center', paddingTop: 20 }}>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 20 }}>
              Don&apos;t have any bookings yet?
            </p>
            <button className="btn btn-outline" onClick={() => navigate('/')}>
              Find an expert
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function BookingRow({ booking }) {
  const config = STATUS_CONFIG[booking.status] || STATUS_CONFIG.pending
  const expertName = booking.expertId?.name || booking.expertName || 'Expert'

  return (
    <div
      className="card fade-up"
      style={{
        padding: '20px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: 20,
      }}
    >
      {/* Status dot */}
      <div style={{
        width: 10,
        height: 10,
        borderRadius: '50%',
        background: config.dot,
        flexShrink: 0,
      }} />

      {/* Main info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4, flexWrap: 'wrap' }}>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontSize: 17,
            fontWeight: 400,
            color: 'var(--text-primary)',
          }}>
            {expertName}
          </span>
          {booking.expertId?.category && (
            <span style={{
              fontSize: 11,
              color: 'var(--text-muted)',
              background: 'var(--bg-elevated)',
              padding: '2px 8px',
              borderRadius: 100,
              fontWeight: 500,
            }}>
              {booking.expertId.category}
            </span>
          )}
        </div>

        <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
          {formatDateTime(booking.date?.slice(0, 10) || '', booking.timeSlot)}
        </div>

        {booking.notes && (
          <div style={{
            fontSize: 12,
            color: 'var(--text-muted)',
            marginTop: 6,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            maxWidth: 400,
          }}>
            Note: {booking.notes}
          </div>
        )}
      </div>

      {/* Badge */}
      <span className={config.className} style={{ flexShrink: 0 }}>
        {config.label}
      </span>
    </div>
  )
}

function SummaryChip({ label, count, color, bg }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      padding: '6px 14px',
      borderRadius: 100,
      background: bg || 'var(--bg-elevated)',
      border: '1px solid var(--border)',
    }}>
      <span style={{
        fontSize: 16,
        fontWeight: 600,
        color: color || 'var(--text-primary)',
        lineHeight: 1,
      }}>
        {count}
      </span>
      <span style={{ fontSize: 12, color: color || 'var(--text-secondary)', fontWeight: 500 }}>
        {label}
      </span>
    </div>
  )
}
