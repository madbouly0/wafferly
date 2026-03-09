'use client'

import { useState, FormEvent, useEffect } from 'react'
import Image from 'next/image'
import { subscribeToProduct } from '@/lib/api'
import { isLoggedIn, getUserEmail, getSessionToken } from '@/lib/auth'

interface ModalProps {
  productId: number
  isOpen: boolean
  onClose: () => void
}

const Modal = ({ productId, isOpen, onClose }: ModalProps) => {
  const [email, setEmail] = useState('')
  const [targetPrice, setTargetPrice] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [isError, setIsError] = useState(false)
  const [isPrefilled, setIsPrefilled] = useState(false)

  useEffect(() => {
    if (isOpen && isLoggedIn()) {
      const storedEmail = getUserEmail();
      if (storedEmail) {
        setEmail(storedEmail);
        setIsPrefilled(true);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setMessage('')
    setIsError(false)

    if (!email.trim()) {
      setMessage('Please enter your email address.')
      setIsError(true)
      return
    }

    try {
      setIsLoading(true)

      // Build the request body — targetPrice is optional
      const body: { email: string; targetPrice?: number } = { email }
      if (targetPrice.trim()) {
        const parsed = parseFloat(targetPrice)
        if (isNaN(parsed) || parsed <= 0) {
          setMessage('Please enter a valid target price (e.g. 49.99).')
          setIsError(true)
          setIsLoading(false)
          return
        }
        body.targetPrice = parsed
      }

      const token = getSessionToken() || undefined;
      const result = await subscribeToProduct(productId, email, body.targetPrice, token)
      setMessage(result.message || 'Subscribed successfully!')
      setIsError(false)
      setEmail('')
      setTargetPrice('')
    } catch (err: any) {
      setMessage(err?.response?.data?.error || 'Something went wrong. Please try again.')
      setIsError(true)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="dialog-container" onClick={onClose}>
      {/* Stop clicks inside the modal from closing it */}
      <div className="dialog-content" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Image src="/assets/icons/logo.svg" alt="Wafferly" width={28} height={28} />
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem', color: '#999', lineHeight: 1 }}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <h2 className="dialog-head_text">Track This Product</h2>
        <p style={{ fontSize: '0.875rem', color: '#6a6a6a', marginBottom: '0.25rem' }}>
          Enter your email and we'll notify you when the price changes.
        </p>

        <form onSubmit={handleSubmit}>

          {/* Email input */}
          <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#2f2f2f', display: 'block', marginTop: '1.25rem', marginBottom: '0.35rem' }}>
            Email address <span style={{ color: '#dc3545' }}>*</span>
          </label>
          <div className="dialog-input_container">
            <Image src="/assets/icons/mail.svg" alt="" width={16} height={16} aria-hidden="true" />
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="dialog-input"
              required
              readOnly={isPrefilled}
              style={isPrefilled ? { cursor: 'not-allowed', backgroundColor: '#f9f9f9', color: '#6a6a6a' } : undefined}
            />
          </div>

          {/* Target price input */}
          <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#2f2f2f', display: 'block', marginTop: '1rem', marginBottom: '0.35rem' }}>
            Target price <span style={{ fontSize: '0.7rem', fontWeight: 400, color: '#999' }}>(optional — notify me only when it drops below this)</span>
          </label>
          <div className="dialog-input_container">
            {/* Currency symbol */}
            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#6a6a6a', flexShrink: 0 }}>$</span>
            <input
              type="number"
              value={targetPrice}
              onChange={e => setTargetPrice(e.target.value)}
              placeholder="e.g. 49.99"
              className="dialog-input"
              min="0"
              step="0.01"
            />
          </div>

          {/* Info note about target price */}
          {targetPrice && (
            <p style={{ fontSize: '0.75rem', color: '#3b5d50', marginTop: '0.4rem', display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
              <span>✓</span>
              We'll only email you when the price drops to ${parseFloat(targetPrice || '0').toFixed(2)} or lower.
            </p>
          )}

          {!targetPrice && (
            <p style={{ fontSize: '0.75rem', color: '#999', marginTop: '0.4rem' }}>
              No target set — you'll be notified on any price drop.
            </p>
          )}

          {/* Result message */}
          {message && (
            <p style={{
              marginTop: '0.75rem',
              fontSize: '0.85rem',
              color: isError ? '#dc3545' : '#198754',
              fontWeight: 500,
            }}>
              {message}
            </p>
          )}

          {/* Submit button */}
          <button
            type="submit"
            className="dialog-btn"
            disabled={isLoading}
            style={{ opacity: isLoading ? 0.7 : 1 }}
          >
            {isLoading ? 'Setting up alerts…' : 'Track Price'}
          </button>
        </form>

        <p style={{ fontSize: '0.72rem', color: '#aaa', marginTop: '1rem', textAlign: 'center', lineHeight: 1.6 }}>
          Every email includes a one-click unsubscribe link.<br />
          We never share your email with anyone.
        </p>

      </div>
    </div>
  )
}

export default Modal