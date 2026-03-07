'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { scrapeProduct } from '@/lib/api'

const isValidAmazonProductURL = (url: string) => {
  try {
    const { hostname } = new URL(url)
    return hostname.includes('amazon.com') || hostname.includes('amazon.') || hostname.endsWith('amazon')
  } catch {
    return false
  }
}

const Searchbar = () => {
  const router = useRouter()
  const [searchPrompt, setSearchPrompt] = useState('')
  const [isLoading, setIsLoading]       = useState(false)
  const [error, setError]               = useState('')

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')

    if (!isValidAmazonProductURL(searchPrompt)) {
      setError('Please paste a valid Amazon product link.')
      return
    }

    try {
      setIsLoading(true)
      // scrapeProduct returns the product data including its id
      const result = await scrapeProduct(searchPrompt)
      setSearchPrompt('')
      // Navigate directly to the product page using the returned product id
      router.push(`/products/${result.data.id}`)
    } catch {
      setError('Failed to track product. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={{ marginTop: '1.25rem' }}>
      <form
        className="searchbar-wrap"
        onSubmit={handleSubmit}
        role="search"
        aria-label="Track an Amazon product"
      >
        <label htmlFor="amazon-url" className="visually-hidden">
          Amazon product URL
        </label>
        <input
          id="amazon-url"
          type="url"
          value={searchPrompt}
          onChange={e => { setSearchPrompt(e.target.value); setError('') }}
          placeholder="Paste Amazon product link here…"
          className="searchbar-input"
          autoComplete="off"
          aria-describedby={error ? 'search-error' : undefined}
        />
        <button
          type="submit"
          className="searchbar-btn"
          disabled={!searchPrompt.trim() || isLoading}
          aria-busy={isLoading}
        >
          {isLoading ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
                style={{ animation: 'spin 0.8s linear infinite' }}
                aria-hidden="true">
                <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
              </svg>
              Tracking…
            </span>
          ) : 'Search'}
        </button>
      </form>

      {error && (
        <p id="search-error" role="alert"
          style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#ff7a7a', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {error}
        </p>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

export default Searchbar