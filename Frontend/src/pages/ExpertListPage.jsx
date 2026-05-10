import { useState, useEffect, useCallback } from 'react'
import { getExperts } from '../api/index.js'
import ExpertCard from '../components/ExpertCard.jsx'
import Pagination from '../components/Pagination.jsx'
import { SkeletonCard, ErrorState } from '../components/LoadingStates.jsx'

const CATEGORIES = [
  'All', 'Technology', 'Business', 'Design', 'Health',
  'Education', 'Marketing', 'Finance', 'Legal',
]

export default function ExpertListPage() {
  const [experts, setExperts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  const LIMIT = 9

  const fetchExperts = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = {
        page,
        limit: LIMIT,
        ...(search.trim() && { search: search.trim() }),
        ...(category !== 'All' && { category }),
      }
      const data = await getExperts(params)
      setExperts(data.experts || data)
      setTotalPages(data.totalPages || 1)
      setTotalCount(data.total || (data.experts || data).length)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [page, search, category])

  useEffect(() => {
    const t = setTimeout(fetchExperts, 300)
    return () => clearTimeout(t)
  }, [fetchExperts])

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1)
  }, [search, category])

  return (
    <div style={{ padding: '48px 0 64px' }}>
      <div className="container">
        {/* Hero header */}
        <div style={{ marginBottom: 40, maxWidth: 560 }}>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(32px, 5vw, 48px)',
            fontWeight: 400,
            lineHeight: 1.15,
            letterSpacing: '-0.02em',
            color: 'var(--text-primary)',
            marginBottom: 12,
          }}>
            Find the right expert<br />
            <em style={{ color: 'var(--accent)' }}>for your session</em>
          </h1>
          <p style={{ fontSize: 16, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Book 1-on-1 sessions with verified professionals across disciplines.
          </p>
        </div>

        {/* Search + filters */}
        <div style={{ marginBottom: 32 }}>
          {/* Search bar */}
          <div style={{ position: 'relative', marginBottom: 16 }}>
            <svg
              style={{
                position: 'absolute',
                left: 14,
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
                pointerEvents: 'none',
              }}
              width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              className="form-input"
              type="text"
              placeholder="Search by name…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: 42, maxWidth: 420 }}
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                style={{
                  position: 'absolute',
                  right: 'calc(100% - 410px)',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  padding: 4,
                }}
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          {/* Category pills */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                style={{
                  padding: '6px 16px',
                  borderRadius: 100,
                  border: '1.5px solid',
                  borderColor: category === cat ? 'var(--accent)' : 'var(--border-strong)',
                  background: category === cat ? 'var(--accent)' : 'transparent',
                  color: category === cat ? 'white' : 'var(--text-secondary)',
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all var(--transition)',
                  fontFamily: 'var(--font-body)',
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Results count */}
        {!loading && !error && (
          <p style={{
            fontSize: 13,
            color: 'var(--text-muted)',
            marginBottom: 20,
          }}>
            {totalCount === 0
              ? 'No experts found'
              : `${totalCount} expert${totalCount !== 1 ? 's' : ''} found`}
          </p>
        )}

        {/* Grid */}
        {error ? (
          <ErrorState message={error} onRetry={fetchExperts} />
        ) : loading ? (
          <div className="grid-3">
            {Array.from({ length: LIMIT }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : experts.length === 0 ? (
          <div className="empty-state">
            <h3>No experts found</h3>
            <p style={{ fontSize: 14, marginTop: 8 }}>
              Try adjusting your search or category filter
            </p>
            <button
              className="btn btn-outline"
              onClick={() => { setSearch(''); setCategory('All') }}
              style={{ marginTop: 20 }}
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid-3">
            {experts.map((expert, i) => (
              <div key={expert._id} style={{ animationDelay: `${i * 50}ms` }}>
                <ExpertCard expert={expert} />
              </div>
            ))}
          </div>
        )}

        <Pagination page={page} totalPages={totalPages} onPage={setPage} />
      </div>
    </div>
  )
}
