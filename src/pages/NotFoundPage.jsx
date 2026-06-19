import React from 'react'
import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="not-found-wrap">
      <div className="not-found-num">404</div>
      <h1 className="not-found-title">Page not found</h1>
      <p style={{ color: 'var(--text-2)', marginBottom: '1.25rem', fontSize: '.95rem' }}>
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link to="/" className="not-found-link">← Back to dashboard</Link>
    </div>
  )
}
