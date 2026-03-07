'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { unsubscribe } from '@/lib/api'

const UnsubscribePage = () => {
  const params = useParams()
  const token = params.token as string

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    // If there is no token in the URL at all, show an error immediately
    if (!token) {
      setMessage('This unsubscribe link is missing a token. Please use the link from your email.')
      setStatus('error')
      return
    }

    const doUnsubscribe = async () => {
      try {
        const result = await unsubscribe(token)
        setMessage(result.message)
        setStatus('success')
      } catch (err: any) {
        // err.response exists when the server replied with an error (e.g. 404)
        // err.message exists when the request never reached the server (e.g. backend is down)
        const serverError = err?.response?.data?.error
        const networkError = err?.message

        if (serverError) {
          setMessage(serverError)
        } else if (networkError) {
          setMessage(`Could not reach the server. Make sure the backend is running. (${networkError})`)
        } else {
          setMessage('Something went wrong. Please try again later.')
        }

        setStatus('error')
      }
    }

    doUnsubscribe()
  }, [token])

  return (
    <div style={{
      minHeight: '70vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
    }}>
      <div style={{
        background: '#fff',
        borderRadius: '20px',
        padding: '3rem 2.5rem',
        maxWidth: '480px',
        width: '100%',
        textAlign: 'center',
        boxShadow: '0px 10px 32px rgba(0,0,0,0.10)',
      }}>

        {/* Loading */}
        {status === 'loading' && (
          <>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#2f2f2f', marginBottom: '0.5rem' }}>
              Processing…
            </h1>
            <p style={{ color: '#6a6a6a' }}>Please wait while we remove your subscription.</p>
          </>
        )}

        {/* Success */}
        {status === 'success' && (
          <>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#2f2f2f', marginBottom: '0.75rem' }}>
              Unsubscribed Successfully
            </h1>
            <p style={{ color: '#6a6a6a', lineHeight: 1.7, marginBottom: '2rem' }}>
              {message}
            </p>
            <Link href="/" style={{
              display: 'inline-block', padding: '12px 30px',
              background: '#3b5d50', color: '#fff', borderRadius: '30px',
              fontWeight: 600, fontSize: '0.9rem', textDecoration: 'none',
            }}>
              Back to Home
            </Link>
          </>
        )}

        {/* Error */}
        {status === 'error' && (
          <>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>❌</div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#2f2f2f', marginBottom: '0.75rem' }}>
              Could Not Unsubscribe
            </h1>
            <p style={{ color: '#6a6a6a', lineHeight: 1.7, marginBottom: '2rem' }}>
              {message}
            </p>
            <Link href="/" style={{
              display: 'inline-block', padding: '12px 30px',
              background: '#3b5d50', color: '#fff', borderRadius: '30px',
              fontWeight: 600, fontSize: '0.9rem', textDecoration: 'none',
            }}>
              Back to Home
            </Link>
          </>
        )}

      </div>
    </div>
  )
}

export default UnsubscribePage