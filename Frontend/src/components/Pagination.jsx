export default function Pagination({ page, totalPages, onPage }) {
  if (totalPages <= 1) return null

  const pages = []
  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= page - 1 && i <= page + 1)
    ) {
      pages.push(i)
    } else if (pages[pages.length - 1] !== '…') {
      pages.push('…')
    }
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      padding: '32px 0',
    }}>
      <PageBtn
        onClick={() => onPage(page - 1)}
        disabled={page === 1}
        label="←"
      />
      {pages.map((p, i) =>
        p === '…' ? (
          <span key={`ellipsis-${i}`} style={{ color: 'var(--text-muted)', padding: '0 4px' }}>
            …
          </span>
        ) : (
          <PageBtn
            key={p}
            onClick={() => onPage(p)}
            active={p === page}
            label={p}
          />
        )
      )}
      <PageBtn
        onClick={() => onPage(page + 1)}
        disabled={page === totalPages}
        label="→"
      />
    </div>
  )
}

function PageBtn({ onClick, disabled, active, label }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: 36,
        height: 36,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 'var(--radius-sm)',
        border: '1.5px solid',
        borderColor: active ? 'var(--accent)' : 'var(--border-strong)',
        background: active ? 'var(--accent)' : 'var(--bg-card)',
        color: active ? 'white' : 'var(--text-secondary)',
        fontSize: 14,
        fontWeight: 500,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.4 : 1,
        transition: 'all var(--transition)',
        fontFamily: 'var(--font-body)',
      }}
    >
      {label}
    </button>
  )
}
