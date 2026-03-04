'use client'

import { useEffect, useState } from 'react'
import HeroCarousel from '@/components/HeroCarousel'
import Searchbar from '@/components/Searchbar'
import ProductCard from '@/components/ProductCard'
import Image from 'next/image'
import { getProducts } from '@/lib/api'
import { Product } from '@/types'

/* ─────────────────────────────────────────────
   Skeleton card — Furni light palette shimmer
───────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <li className="skeleton-card" aria-hidden="true">
      <div className="skeleton skeleton-img" />
      <div style={{ padding: '1rem' }}>
        <div className="skeleton skeleton-line" />
        <div className="skeleton skeleton-line short" />
      </div>
    </li>
  )
}

/* ─────────────────────────────────────────────
   Feature card — Furni "why choose us" style
───────────────────────────────────────────── */
interface FeatureProps {
  icon: React.ReactNode
  title: string
  description: string
}

function FeatureCard({ icon, title, description }: FeatureProps) {
  return (
    <article className="feature-card">
      <div className="feature-icon" aria-hidden="true">{icon}</div>
      <h3>{title}</h3>
      <p>{description}</p>
    </article>
  )
}

/* ─────────────────────────────────────────────
   Main page
───────────────────────────────────────────── */
const Home = () => {
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      try {
        const response = await getProducts()
        setAllProducts(response.data || [])
      } catch (err) {
        console.error('Failed to fetch products:', err)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  return (
    <>
      <div className="page-top-half">
      {/* ═══════════════════════════════════════
          HERO — Furni: green bg, white copy,
          gold accent, image floats on right
      ═══════════════════════════════════════ */}
      <section className="hero" aria-labelledby="hero-heading">
        <div className="hero-inner">

          {/* Left: copy + search */}
          <div className="hero-content">
            <p className="small-text" aria-label="Tagline">
              Smart Shopping Starts Here
              <Image
                src="/assets/icons/arrow-right.svg"
                alt=""
                aria-hidden="true"
                width={16}
                height={16}
              />
            </p>

            <h1 id="hero-heading" className="head-text">
              Use <span className="text-primary"> Wafferly  </span>
              And Never Overpay Again
              
            </h1>

            <p className="hero-sub">
              Start saving money today and Join shoppers who let Wafferly do the price-watching for them.
            </p>

            {/* Search */}
            <div role="search" aria-label="Track a product by URL">
              <Searchbar />
            </div>

            {/* Trust badges */}
            <ul className="trust-row" aria-label="Key features">
              <li><span aria-hidden="true">✓</span> Free to use</li>
              <li><span aria-hidden="true">✓</span> Instant email alerts</li>
              <li><span aria-hidden="true">✓</span> Price history charts</li>
              <li><span aria-hidden="true">✓</span> Auto re-checks </li>
            </ul>
          </div>

          {/* Right: product carousel */}
          <div className="hero-visual" aria-hidden="true">
            <HeroCarousel />
          </div>
        </div>
      </section>


      </div>  {/* /page-top-half */}



      {/* ═══════════════════════════════════════
          FEATURES — Furni "Why Choose Us" pattern
      ═══════════════════════════════════════ */}
      <section className="features-section" aria-labelledby="features-heading">
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <header className="section-header">
            <h2 id="features-heading" className="section-title">Why Choose Wafferly</h2>
            <p className="section-sub">
              Set up tracking once — we do the rest. No refreshing, no hunting for coupons.
            </p>
          </header>

          <div className="features-grid" role="list">
            <FeatureCard
              icon={
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.82a19.79 19.79 0 01-3.07-8.67A2 2 0 012 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
                </svg>
              }
              title="Instant Email Alerts"
              description="The moment a price drops, you get an email — no app to install, no checking required."
            />
            <FeatureCard
              icon={
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                </svg>
              }
              title="Full Price History"
              description="Interactive charts going back months so you can spot seasonal dips and buy at the right time."
            />
            <FeatureCard
              icon={
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
              }
              title="Auto Re-check Every 6 hrs"
              description="Wafferly re-scrapes Amazon automatically, keeping your price data fresh and accurate around the clock."
            />
            <FeatureCard
              icon={
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
                </svg>
              }
              title="Clean Dashboard"
              description="All your tracked products in one place — current price, average, highest, and lowest at a glance."
            />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          TRENDING — Furni product grid with
          the signature hover animation
      ═══════════════════════════════════════ */}
      <section className="trending-section" aria-labelledby="trending-heading">
        {/* Left-aligned Furni-style section header */}
        <header className="section-header">
          <h2 id="trending-heading" className="section-title">Best Offers</h2>
          <p className="section-sub">
            Products our community is tracking — sorted by the biggest current discounts.
          </p>
        </header>

        {loading ? (
          /* Accessible loading state */
          <ul
            className="products-grid"
            aria-busy="true"
            aria-label="Loading tracked products"
            style={{ maxWidth: '1200px', margin: '0 auto' }}
          >
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </ul>
        ) : allProducts.length === 0 ? (
          /* Empty state */
          <div className="empty-state" role="status">
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
              aria-hidden="true">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <h3>No products tracked yet</h3>
            <p>Paste an Amazon link above to start watching prices.</p>
            <a href="#hero-heading" className="btn btn-primary">Track your first product</a>
          </div>
        ) : (
          /* ── Furni-style product grid ── */
          <ul
            className="products-grid"
            aria-label="Tracked products with current deals"
            style={{ maxWidth: '1200px', margin: '0 auto' }}
          >
            {allProducts.map((product) => (
              <li key={product.id}>
                <ProductCard product={product} />
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ═══════════════════════════════════════
          CTA — Furni green bg, gold + ghost btns
      ═══════════════════════════════════════ */}
      <section className="cta-section" aria-labelledby="cta-heading">
        <div className="cta-inner">
          <div>
            <h2 id="cta-heading">Start saving money today</h2>
            <p>
              Join thousands of shoppers who let Wafferly do the price-watching for them.
            </p>
          </div>
          <div className="cta-actions">
            <a href="/track" className="btn btn-secondary">Track a Product</a>
            <a href="/about" className="btn btn-white-outline">Learn More</a>
          </div>
        </div>
      </section>
    </>
  )
}

export default Home