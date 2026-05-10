export function SkeletonCard() {
  return (
    <div
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        padding: 20,
      }}
    >
      <div style={{ display: 'flex', gap: 14, marginBottom: 14 }}>
        <div className="skeleton" style={{ width: 52, height: 52, borderRadius: '50%' }} />
        <div style={{ flex: 1 }}>
          <div className="skeleton" style={{ height: 18, marginBottom: 8, width: '60%' }} />
          <div className="skeleton" style={{ height: 14, width: '35%' }} />
        </div>
      </div>
      <div className="skeleton" style={{ height: 13, marginBottom: 6 }} />
      <div className="skeleton" style={{ height: 13, width: '75%', marginBottom: 16 }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 14, borderTop: '1px solid var(--border)' }}>
        <div className="skeleton" style={{ height: 14, width: '40%' }} />
        <div className="skeleton" style={{ height: 14, width: '20%' }} />
      </div>
    </div>
  )
}

export function SkeletonDetail() {
  return (
    <div style={{ maxWidth: 800, margin: '48px auto', padding: '0 24px' }}>
      <div className="skeleton" style={{ height: 28, width: '50%', marginBottom: 24 }} />
      <div style={{ display: 'flex', gap: 16, marginBottom: 32 }}>
        {[1, 2, 3].map((i) => (
          <div key={i} className="skeleton" style={{ height: 80, flex: 1, borderRadius: 'var(--radius-md)' }} />
        ))}
      </div>
      <div className="skeleton" style={{ height: 200, borderRadius: 'var(--radius-md)' }} />
    </div>
  )
}

export function ErrorState({ message, onRetry }) {
  return (
    <div style={{
      textAlign: 'center',
      padding: '64px 24px',
      color: 'var(--text-muted)',
    }}>
      <div style={{ fontSize: 40, marginBottom: 16 }}>⚠</div>
      <h3 style={{
        fontFamily: 'var(--font-display)',
        fontSize: 20,
        fontWeight: 400,
        color: 'var(--text-secondary)',
        marginBottom: 8,
      }}>
        {message || 'Something went wrong'}
      </h3>
      {onRetry && (
        <button className="btn btn-outline" onClick={onRetry} style={{ marginTop: 16 }}>
          Try again
        </button>
      )}
    </div>
  )
}
