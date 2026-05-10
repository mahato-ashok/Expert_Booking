import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getExpert } from '../api/index.js'
import { useExpertSocket } from '../hooks/useExpertSocket.js'
import { Avatar, StarRating, CATEGORY_COLORS } from '../components/ExpertCard.jsx'
import { SkeletonDetail, ErrorState } from '../components/LoadingStates.jsx'

function groupSlotsByDate(slots = []) {
  const map = {}
  slots.forEach((slot) => {
    const dateKey = slot.date?.slice(0, 10)
    if (!dateKey) return
    if (!map[dateKey]) map[dateKey] = []
    map[dateKey].push(slot)
  })
  return Object.entries(map).sort(([a], [b]) => (a > b ? 1 : -1))
}

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-IN', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
  })
}

export default function ExpertDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [expert, setExpert] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [liveBooked, setLiveBooked] = useState(new Set()) // tracks real-time bookings

  const fetchExpert = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getExpert(id)
      setExpert(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { fetchExpert() }, [fetchExpert])

  // Real-time: when another user books a slot, mark it instantly
  const handleSlotBooked = useCallback(({ date, timeSlot }) => {
    const key = `${date?.slice(0, 10)}_${timeSlot}`
    setLiveBooked((prev) => new Set([...prev, key]))
  }, [])

  useExpertSocket(id, handleSlotBooked)

  const isSlotBooked = (slot) => {
    if (slot.isBooked) return true
    const key = `${slot.date?.slice(0, 10)}_${slot.time}`
    return liveBooked.has(key)
  }

  if (loading) return <SkeletonDetail />
  if (error) return (
    <div className="container" style={{ paddingTop: 48 }}>
      <ErrorState message={error} onRetry={fetchExpert} />
    </div>
  )
  if (!expert) return null

  const catStyle = CATEGORY_COLORS[expert.category] || {
    bg: 'var(--bg-muted)', color: 'var(--text-secondary)',
  }
  const grouped = groupSlotsByDate(expert.availableSlots)
  const freeSlots = expert.availableSlots?.filter((s) => !isSlotBooked(s)).length || 0

  return (
    <div style={{ padding: '40px 0 80px' }}>
      <div className="container" style={{ maxWidth: 880 }}>
        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="btn btn-ghost"
          style={{ marginBottom: 24, paddingLeft: 0 }}
        >
          ← Back to experts
        </button>

        {/* Profile header */}
        <div
          className="card fade-up"
          style={{
            padding: '32px',
            marginBottom: 28,
            display: 'flex',
            gap: 28,
            alignItems: 'flex-start',
          }}
        >
          <Avatar name={expert.name} size={80} />
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <h1 style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 30,
                  fontWeight: 400,
                  lineHeight: 1.2,
                  marginBottom: 8,
                }}>
                  {expert.name}
                </h1>
                <span style={{
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  padding: '3px 10px',
                  borderRadius: 100,
                  background: catStyle.bg,
                  color: catStyle.color,
                }}>
                  {expert.category}
                </span>
              </div>
              <button
                className="btn btn-primary"
                onClick={() => navigate(`/book/${expert._id}`)}
                disabled={freeSlots === 0}
              >
                {freeSlots === 0 ? 'No slots available' : 'Book a session →'}
              </button>
            </div>

            {/* Stats row */}
            <div style={{
              display: 'flex',
              gap: 28,
              marginTop: 20,
              paddingTop: 20,
              borderTop: '1px solid var(--border)',
            }}>
              <StatChip label="Experience" value={`${expert.experience} yrs`} />
              <StatChip
                label="Rating"
                value={
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <StarRating rating={expert.rating || 0} />
                    <span>{expert.rating?.toFixed(1) || '—'}</span>
                  </span>
                }
              />
              <StatChip
                label="Free slots"
                value={freeSlots}
                accent={freeSlots > 0}
              />
            </div>
          </div>
        </div>

        {/* Bio */}
        {expert.bio && (
          <div className="card" style={{ padding: '24px 28px', marginBottom: 28 }}>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 18,
              fontWeight: 400,
              marginBottom: 12,
            }}>
              About
            </h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75 }}>{expert.bio}</p>
          </div>
        )}

        {/* Available slots */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 22,
              fontWeight: 400,
            }}>
              Available sessions
            </h2>
            <span style={{
              fontSize: 12,
              color: 'var(--text-muted)',
              background: 'var(--bg-elevated)',
              padding: '4px 10px',
              borderRadius: 100,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}>
              <span style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: 'var(--accent)',
                display: 'inline-block',
                animation: 'pulse 2s infinite',
              }} />
              Live updates
            </span>
          </div>

          <style>{`
            @keyframes pulse {
              0%, 100% { opacity: 1; }
              50% { opacity: 0.3; }
            }
          `}</style>

          {grouped.length === 0 ? (
            <div className="empty-state">
              <h3>No available slots</h3>
              <p style={{ fontSize: 14, marginTop: 6 }}>
                All sessions for this expert are currently booked.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {grouped.map(([date, slots]) => (
                <div
                  key={date}
                  className="card"
                  style={{ padding: '20px 24px' }}
                >
                  <h3 style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: 'var(--text-secondary)',
                    marginBottom: 14,
                    letterSpacing: '0.02em',
                  }}>
                    {formatDate(date)}
                  </h3>
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 8,
                  }}>
                    {slots.map((slot) => {
                      const booked = isSlotBooked(slot)
                      return (
                        <button
                          key={slot._id || slot.time}
                          onClick={() => !booked && navigate(`/book/${expert._id}?date=${date}&slot=${slot.time}`)}
                          disabled={booked}
                          style={{
                            padding: '8px 16px',
                            borderRadius: 'var(--radius-sm)',
                            border: '1.5px solid',
                            borderColor: booked
                              ? 'var(--border)'
                              : 'var(--accent)',
                            background: booked
                              ? 'var(--bg-elevated)'
                              : 'var(--accent-light)',
                            color: booked
                              ? 'var(--text-muted)'
                              : 'var(--accent)',
                            fontSize: 13,
                            fontWeight: 500,
                            cursor: booked ? 'not-allowed' : 'pointer',
                            textDecoration: booked ? 'line-through' : 'none',
                            transition: 'all var(--transition)',
                            fontFamily: 'var(--font-body)',
                          }}
                          onMouseEnter={(e) => {
                            if (!booked) {
                              e.currentTarget.style.background = 'var(--accent)'
                              e.currentTarget.style.color = 'white'
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!booked) {
                              e.currentTarget.style.background = 'var(--accent-light)'
                              e.currentTarget.style.color = 'var(--accent)'
                            }
                          }}
                        >
                          {booked ? `${slot.time} · booked` : slot.time}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function StatChip({ label, value, accent }) {
  return (
    <div>
      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>{label}</div>
      <div style={{
        fontSize: 16,
        fontWeight: 600,
        color: accent ? 'var(--accent)' : 'var(--text-primary)',
      }}>
        {value}
      </div>
    </div>
  )
}
