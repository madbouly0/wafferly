'use client'

import { FormEvent, useState } from 'react'
import { subscribeToProduct} from '@/lib/api'

interface Props {
  productId: number
  isOpen: boolean
  onClose: () => void
}

const Modal = ({ productId, isOpen, onClose }: Props) => {
  const [email, setEmail]       = useState('')
  const [isLoading, setLoading] = useState(false)
  const [sent, setSent]         = useState(false)
  const [error, setError]       = useState('')

  if (!isOpen) return null

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')

    if (!email.includes('@')) {
      setError('Please enter a valid email address.')
      return
    }

    try {
      setLoading(true)
      await subscribeToProduct(productId, email)
      setSent(true)
      setEmail('')
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setSent(false)
    setError('')
    setEmail('')
    onClose()
  }

  return (
    /* Backdrop */
    <div
      className="dialog-container"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={e => { if (e.target === e.currentTarget) handleClose() }}
    >
      <div className="dialog-content">

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          {/* Icon */}
          <div style={{
            width: 44, height: 44,
            borderRadius: '10px',
            background: 'rgba(59,93,80,0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--color-primary)',
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              aria-hidden="true">
              <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
            </svg>
          </div>

          {/* Close */}
          <button
            onClick={handleClose}
            aria-label="Close"
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--color-body)', padding: '4px',
              borderRadius: '6px', transition: '.2s',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {sent ? (
          /* Success state */
          <div style={{ textAlign: 'center', padding: '1.5rem 0 0.5rem' }}>
            <div style={{
              width: 52, height: 52, borderRadius: '50%',
              background: 'rgba(59,93,80,0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1rem',
              color: 'var(--color-primary)',
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                aria-hidden="true">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <h3 className="dialog-head_text">You're all set!</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-body)', marginTop: '0.4rem' }}>
              We'll email you when the price drops.
            </p>
            <button className="dialog-btn" onClick={handleClose} style={{ marginTop: '1.5rem' }}>
              Done
            </button>
          </div>
        ) : (
          /* Form */
          <form onSubmit={handleSubmit}>
            <h3 id="modal-title" className="dialog-head_text">
              Track this price
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-body)', marginTop: '0.3rem', marginBottom: '0.25rem' }}>
              Enter your email and we'll alert you the moment the price drops.
            </p>

            {/* Email input */}
            <div className="dialog-input_container">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                style={{ color: 'var(--color-body)', flexShrink: 0 }} aria-hidden="true">
                <rect x="2" y="4" width="20" height="16" rx="2"/>
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
              </svg>
              <label htmlFor="modal-email" className="visually-hidden">Email address</label>
              <input
                id="modal-email"
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setError('') }}
                placeholder="your@email.com"
                className="dialog-input"
                autoComplete="email"
                required
              />
            </div>

            {error && (
              <p role="alert" style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#E43030' }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              className="dialog-btn"
              disabled={!email.trim() || isLoading}
              aria-busy={isLoading}
            >
              {isLoading ? 'Setting up alert…' : 'Notify me when price drops'}
            </button>
          </form>
        )}

      </div>
    </div>
  )
}

export default Modal