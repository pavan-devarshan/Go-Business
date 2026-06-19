import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Cookies from 'js-cookie'
import Navbar from '../components/Navbar.jsx'

const API_BASE = 'https://v9fes04dwf.execute-api.eu-north-1.amazonaws.com/api/referrals'
const PAGE_SIZE = 10

function formatDate(iso) {
  if (!iso) return ''
  return iso.replace(/-/g, '/')
}

function formatProfit(n) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD', maximumFractionDigits: 0,
  }).format(n)
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('desc')
  const [page, setPage] = useState(1)
  const [copiedLink, setCopiedLink] = useState(false)
  const [copiedCode, setCopiedCode] = useState(false)
  const debounceRef = useRef(null)

  const fetchReferrals = useCallback(async (q, s) => {
    setLoading(true)
    setError('')
    try {
      const token = Cookies.get('jwt_token')
      const params = new URLSearchParams()
      if (q) params.set('search', q)
      if (s) params.set('sort', s)
      const url = params.toString() ? `${API_BASE}?${params}` : API_BASE
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const json = await res.json()
      if (!res.ok) {
        setError(`${json.message || 'Error'} (${res.status})`)
        setData(null)
      } else {
        const d = json.data || json
        setData(d)
        setPage(1)
      }
    } catch (err) {
      setError('Failed to load data. Check your connection.')
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchReferrals('', 'desc') }, [fetchReferrals])

  function handleSearch(e) {
    const q = e.target.value
    setSearch(q)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => fetchReferrals(q, sort), 400)
  }

  function handleSort(e) {
    const s = e.target.value
    setSort(s)
    fetchReferrals(search, s)
  }

  async function copyText(text, setter) {
    try {
      await navigator.clipboard.writeText(text)
      setter(true)
      setTimeout(() => setter(false), 2000)
    } catch {}
  }

  const referrals = data?.referrals ?? []
  const totalPages = Math.max(1, Math.ceil(referrals.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const from = referrals.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1
  const to = Math.min(safePage * PAGE_SIZE, referrals.length)
  const pageRows = referrals.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  const metrics = data?.metrics ?? []
  const ss = data?.serviceSummary ?? {}
  const ref = data?.referral ?? {}

  return (
    <>
      <Navbar />
      <main className="page-wrapper">
        <div className="dash-header">
          <h1>Referral Dashboard</h1>
          <p>Track your referrals, earnings, and partner activity in one place.</p>
        </div>

        {loading && !data && (
          <div className="state-box">
            <div className="spinner"></div>
            <p>Loading your dashboard…</p>
          </div>
        )}

        {error && (
          <div className="alert-error" role="alert">{error}</div>
        )}

        {data && (
          <>
            {/* OVERVIEW */}
            <section role="region" aria-label="Overview metrics">
              <h2 className="section-title">Overview</h2>
              <div className="metrics-grid">
                {metrics.map(m => (
                  <div className="metric-card" key={m.id}>
                    <div className="metric-label">{m.label}</div>
                    <div className="metric-value">{m.value}</div>
                  </div>
                ))}
              </div>
            </section>

            {/* SERVICE SUMMARY */}
            <div className="card" aria-label="Service summary">
              <h2 className="section-title">Service summary</h2>
              <div className="service-grid">
                <div className="service-item">
                  <div className="service-item-label">Service</div>
                  <div className="service-item-value">{ss.service}</div>
                </div>
                <div className="service-item">
                  <div className="service-item-label">Your Referrals</div>
                  <div className="service-item-value">{ss.yourReferrals}</div>
                </div>
                <div className="service-item">
                  <div className="service-item-label">Active Referrals</div>
                  <div className="service-item-value">{ss.activeReferrals}</div>
                </div>
                <div className="service-item">
                  <div className="service-item-label">Total Ref. Earnings</div>
                  <div className="service-item-value">{ss.totalRefEarnings}</div>
                </div>
              </div>
            </div>

            {/* SHARE REFERRAL */}
            <div className="card" aria-label="Share referral">
              <div className="referral-panel-title">Refer friends and earn more</div>
              <div className="referral-row">
                <span className="referral-label">Your Referral Link</span>
                <input
                  className="referral-input"
                  readOnly
                  value={ref.link ?? ''}
                  aria-label="Your Referral Link"
                />
                <button
                  className={`btn-copy${copiedLink ? ' copied' : ''}`}
                  onClick={() => copyText(ref.link, setCopiedLink)}
                  aria-label="Copy referral link"
                >
                  {copiedLink ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <div className="referral-row">
                <span className="referral-label">Your Referral Code</span>
                <input
                  className="referral-input"
                  readOnly
                  value={ref.code ?? ''}
                  aria-label="Your Referral Code"
                />
                <button
                  className={`btn-copy${copiedCode ? ' copied' : ''}`}
                  onClick={() => copyText(ref.code, setCopiedCode)}
                  aria-label="Copy referral code"
                >
                  {copiedCode ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            {/* ALL REFERRALS TABLE */}
            <div className="card">
              <h2 className="section-title">All referrals</h2>
              <div className="table-toolbar">
                <input
                  className="search-input"
                  placeholder="Name or service…"
                  value={search}
                  onChange={handleSearch}
                  aria-label="Search referrals"
                />
                <label className="sort-label">
                  Sort by date
                  <select className="sort-select" value={sort} onChange={handleSort}>
                    <option value="desc">Newest first</option>
                    <option value="asc">Oldest first</option>
                  </select>
                </label>
              </div>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Service</th>
                      <th>Date</th>
                      <th>Profit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageRows.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="empty-state">No matching entries</td>
                      </tr>
                    ) : (
                      pageRows.map(row => (
                        <tr
                          key={row.id}
                          onClick={() => navigate(`/referral/${row.id}`)}
                          tabIndex={0}
                          onKeyDown={e => e.key === 'Enter' && navigate(`/referral/${row.id}`)}
                        >
                          <td>{row.name}</td>
                          <td>{row.serviceName}</td>
                          <td>{formatDate(row.date)}</td>
                          <td>{formatProfit(row.profit)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {referrals.length > 0 && (
                <div className="pagination-wrap">
                  <span className="pagination-info">
                    Showing {from}–{to} of {referrals.length} entries
                  </span>
                  <div className="pagination-btns">
                    <button
                      className="btn-page"
                      disabled={safePage === 1}
                      onClick={() => setPage(p => p - 1)}
                    >
                      Previous
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                      <button
                        key={n}
                        className={`btn-page${n === safePage ? ' active' : ''}`}
                        onClick={() => setPage(n)}
                        aria-current={n === safePage ? 'page' : undefined}
                      >
                        {n}
                      </button>
                    ))}
                    <button
                      className="btn-page"
                      disabled={safePage === totalPages}
                      onClick={() => setPage(p => p + 1)}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </main>

      <footer className="site-footer">
        <span className="footer-brand">Go Business</span>
        <nav className="footer-nav" aria-label="Footer">
          <a href="#">About</a>
          <a href="#">Privacy</a>
        </nav>
        <span className="footer-copy">© 2024 Go Business</span>
      </footer>
    </>
  )
}
