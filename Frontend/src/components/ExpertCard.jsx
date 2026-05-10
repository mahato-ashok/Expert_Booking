import { Link } from 'react-router-dom'

const CATEGORY_COLORS = {
  Technology: { bg: '#e8f2eb', color: '#2d5a3d' },
  Business: { bg: '#fdf3e0', color: '#c47d1a' },
  Design: { bg: '#f0eeff', color: '#5b4fcf' },
  Health: { bg: '#fdecea', color: '#c0392b' },
  Education: { bg: '#e8f6ff', color: '#1a6fa8' },
  Marketing: { bg: '#fff0e8', color: '#c4581a' },
  Finance: { bg: '#e8f5e8', color: '#2a7a2a' },
  Legal: { bg: '#f5eee8', color: '#8a5a2a' },
}

function StarRating({ rating }) {
  const full = Math.floor(rating)
  const half = rating % 1 >= 0.5
  const empty = 5 - full - (half ? 1 : 0)
  return (
    <span className="stars" aria-label={`${rating} out of 5`}>
      {'★'.repeat(full)}
      {half ? '½' : ''}
      {'☆'.repeat(empty)}
    </span>
  )
}

function Avatar({ name, size = 48 }) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
  const hue = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % 360
  return (
    <div
      aria-hidden="true"
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: `hsl(${hue}, 40%, 88%)`,
        color: `hsl(${hue}, 40%, 30%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 600,
        fontSize: size * 0.35,
        flexShrink: 0,
        fontFamily: 'var(--font-body)',
      }}
    >
      {initials}
    </div>
  )
}

export { Avatar, StarRating, CATEGORY_COLORS }

export default function ExpertCard({ expert }) {
  const catStyle = CATEGORY_COLORS[expert.category] || {
    bg: 'var(--bg-muted)',
    color: 'var(--text-secondary)',
  }

  const freeSlots = expert.availableSlots?.filter((s) => !s.isBooked).length || 0

  return (
    <Link to={`/experts/${expert._id}`} style={{ textDecoration: 'none' }}>
      <article
        className="card fade-up"
        style={{ padding: '20px', cursor: 'pointer' }}
      >
        {/* Header */}
        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 14 }}>
          <Avatar name={expert.name} size={52} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 17,
              fontWeight: 400,
              color: 'var(--text-primary)',
              marginBottom: 2,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {expert.name}
            </h3>
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                padding: '2px 8px',
                borderRadius: 100,
                background: catStyle.bg,
                color: catStyle.color,
              }}
            >
              {expert.category}
            </span>
          </div>
        </div>

        {/* Bio */}
        {expert.bio && (
          <p style={{
            fontSize: 13,
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
            marginBottom: 14,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>
            {expert.bio}
          </p>
        )}

        {/* Footer */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: 14,
          borderTop: '1px solid var(--border)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <StarRating rating={expert.rating || 0} />
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              ({expert.rating?.toFixed(1) || '—'})
            </span>
          </div>
          <div style={{ display: 'flex', gap: 14 }}>
            <Stat label="yrs" value={expert.experience} />
            <Stat label="slots" value={freeSlots} accent={freeSlots > 0} />
          </div>
        </div>
      </article>
    </Link>
  )
}

function Stat({ label, value, accent }) {
  return (
    <div style={{ textAlign: 'right' }}>
      <div style={{
        fontSize: 16,
        fontWeight: 600,
        color: accent ? 'var(--accent)' : 'var(--text-primary)',
        lineHeight: 1,
      }}>
        {value}
      </div>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{label}</div>
    </div>
  )
}
