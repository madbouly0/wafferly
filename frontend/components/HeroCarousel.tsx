'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'

/* Static showcase items — replace image srcs with your actual assets */
const SLIDES = [
  {
    id: 1,
    label: 'Trending Deal',
    title: 'Sony WH-1000XM5',
    subtitle: 'Noise Cancelling Headphones',
    price: '$299',
    originalPrice: '$399',
    image: '/assets/images/—Pngtree—headphones on transparent background_18122707.png',
    href: '/',
  },
  {
    id: 2,
    label: 'Price Drop',
    title: 'Apple AirPods Pro',
    subtitle: '2nd Generation — Waterproof',
    price: '$189',
    originalPrice: '$249',
    image: '/assets/images/Gemini_Generated_Image_htff1uhtff1uhtff-removebg-preview.png',
    href: '/',
  },
  {
    id: 3,
    label: 'Best Seller',
    title: 'Fizili men\'s watch',
    subtitle: 'Classic Leather Strap - Quartz Movement',
    price: '$99',
    originalPrice: '$139',
    image: '/assets/images/Screenshot_2026-03-04_062802-removebg-preview.png',
    href: '/',
  },
]

const HeroCarousel = () => {
  const [current, setCurrent] = useState(0)

  /* Auto-advance every 4 s */
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent(i => (i + 1) % SLIDES.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [])

  const slide = SLIDES[current]

  return (
    <div className="hero-carousel" aria-label="Featured products carousel" aria-live="polite">

      {/* Product image — levitates with radial glow backlight */}
      <Link href={slide.href} tabIndex={-1} aria-hidden="true">
        <div className="carousel-glow">
          <Image
            src={slide.image}
            alt={slide.title}
            width={280}
            height={280}
            className="hero-carousel-img"
            style={{
              objectFit: 'contain', maxHeight: '280px',
              filter: 'drop-shadow(0 16px 32px rgba(0,0,0,0.25))',
              position: 'relative', zIndex: 1,
            }}
            priority
          />
        </div>
      </Link>

      {/* Text block */}
      <div style={{ padding: '0 0.5rem' }}>
        {/* Label */}
        <span style={{
          display: 'inline-block',
          fontSize: '0.7rem', fontWeight: 700,
          letterSpacing: '0.07em', textTransform: 'uppercase',
          color: 'var(--color-secondary)',
          marginBottom: '0.4rem',
        }}>
          {slide.label}
        </span>

        {/* Title + subtitle */}
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', lineHeight: 1.25, marginBottom: '0.2rem' }}>
          {slide.title}
        </h3>
        <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginBottom: '0.75rem' }}>
          {slide.subtitle}
        </p>

        {/* Price row */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-secondary)' }}>
            {slide.price}
          </span>
          <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.35)', textDecoration: 'line-through' }}>
            {slide.originalPrice}
          </span>
        </div>
      </div>

      {/* Dot nav — gold active dot, Furni style */}
      <div
        style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '1.25rem' }}
        role="tablist"
        aria-label="Carousel navigation"
      >
        {SLIDES.map((s, i) => (
          <button
            key={s.id}
            role="tab"
            aria-selected={i === current}
            aria-label={`Slide ${i + 1}: ${s.title}`}
            onClick={() => setCurrent(i)}
            style={{
              width: i === current ? '20px' : '8px',
              height: '8px',
              borderRadius: '4px',
              background: i === current ? 'var(--color-secondary)' : 'rgba(255,255,255,0.3)',
              border: 'none', cursor: 'pointer', padding: 0,
              transition: 'all .3s ease',
            }}
          />
        ))}
      </div>

    </div>
  )
}

export default HeroCarousel