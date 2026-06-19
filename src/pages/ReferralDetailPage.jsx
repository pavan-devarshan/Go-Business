import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import Cookies from 'js-cookie'
import Navbar from '../components/Navbar.jsx'

const API_BASE = 'https://v9fes04dwf.execute-api.eu-north-1.amazonaws.com/api/referrals'

function formatDate(iso) {
  if (!iso) return ''
  return iso.replace(/-/g, '/')
}

function formatProfit(n) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD', maximumFractionDigits: 0,
  }).format(n)
}

export default function ReferralDetailPage() {
  const { id } = useParams()
  const [referral, setReferral] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    async function load() {
      setLoading(true)
      setNotFound(false)
      try {
        const token = Cookies.get('jwt_token')
        const res = await fetch(`${API_BASE}?id=${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const json = await res.json()
        const d = json.data

        // d may be the row itself or contain a referrals array
        if (d) {
          if (d.id !== undefined && String(d.id) === String(id)) {
            setReferral(d)
          } else if (Array.isArray(d.referrals)) {
            const found = d.referrals.find(r => String(r.id) === String(id))
            if (found) setReferral(found)
            else setNotFound(true)
          } else if (Array.isArray(d) ) {
            const found = d.find(r => String(r.id) === String(id))
            if (found) setReferral(found)
            else setNotFound(true)
          } else {
            setNotFound(true)
          }
        } else {
          setNotFound(true)
        }
      } catch {
        setNotFound(true)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  return (
    <>
      <Navbar />
      <main className="page-wrapper">
        <Link to="/" className="detail-back">← Back to dashboard</Link>

        {loading && (
          <div className="state-box">
            <div className="spinner"></div>
            <p>Loading referral…</p>
          </div>
        )}

        {!loading && notFound && (
          <div className="card">
            <h1 className="detail-heading">Referral not found</h1>
            <p style={{ color: 'var(--text-2)', marginTop: '.5rem' }}>
              The referral with ID {id} could not be found.
            </p>
          </div>
        )}

        {!loading && referral && (
          <div className="card">
            <h1 className="detail-heading">Referral Details</h1>
            <p className="detail-name">{referral.name}</p>
            <dl>
              <dt>Referral ID</dt>
              <dd>{referral.id}</dd>
              <dt>Service Name</dt>
              <dd>{referral.serviceName}</dd>
              <dt>Date</dt>
              <dd>{formatDate(referral.date)}</dd>
              <dt>Profit</dt>
              <dd>{formatProfit(referral.profit)}</dd>
            </dl>
          </div>
        )}
      </main>
    </>
  )
}
