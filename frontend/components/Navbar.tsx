'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { isLoggedIn, getUserEmail } from '@/lib/auth'

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/products', label: 'Products' },
  { href: '/about', label: 'About Us' },
]

const Navbar = () => {
  const pathname = usePathname()
  const [hasSession, setHasSession] = useState(false)
  const [emailInitials, setEmailInitials] = useState('')

  useEffect(() => {
    setHasSession(isLoggedIn())
    const email = getUserEmail()
    if (email) {
      setEmailInitials(email.substring(0, 2).toUpperCase())
    }
  }, [pathname])

  return (
    <nav className="nav" aria-label="Main navigation">


      {/* — Logo Section — */}
      <Link href="/" className="nav-logo" style={{ display: 'flex', alignItems: 'center', gap: '0', textDecoration: 'none' }}>
        {/* The unique symbol icon acting as the 'W' */}
        <Image
          src="/assets/images/Gemini_Generated_Image_fmlfcafmlfcafmlf-removebg-preview.png"
          alt="Wafferly Symbol"
          width={50}
          height={50}
        />

        {/* The rest of the wordmark ("afferly.") */}
        <span style={{ color: '#FFFFFF', fontWeight: 'bold', fontSize: '1.8rem', letterSpacing: '1px' }}>
          Wafferly<span className="dot" style={{ color: '#E4BF57' }}>.</span>
        </span>
      </Link>

      {/* ── Centre links ── */}
      <ul className="nav-links" role="list">
        {NAV_LINKS.map(({ href, label }) => (
          <li key={href}>
            <Link
              href={href}
              className={pathname === href ? 'active' : ''}
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>

      {/* ── Icon CTAs ── */}
      <ul className="nav-cta flex items-center gap-4" role="list">
        <li>
          <Link href="/search" aria-label="Search products">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              aria-hidden="true">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
          </Link>
        </li>
        <li>
          <Link href="/wishlist" aria-label="Wishlist">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              aria-hidden="true">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </Link>
        </li>

        {/* Auth State Button */}
        <li className="ml-2">
          {hasSession ? (
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-3 py-1.5 bg-[#E4BF57] hover:bg-[#d4b04d] text-[#1e1e1e] font-medium rounded-full transition-colors text-sm"
            >
              <div className="w-6 h-6 flex items-center justify-center bg-white rounded-full text-xs font-bold shadow-sm">
                {emailInitials}
              </div>
              Dashboard
            </Link>
          ) : (
            <Link
              href="/auth/login"
              className="px-4 py-2 border border-[#E4BF57] text-[#E4BF57] hover:bg-[#E4BF57] hover:text-[#1e1e1e] font-medium rounded-full transition-colors text-sm"
            >
              Sign In
            </Link>
          )}
        </li>
      </ul>

    </nav>
  )
}

export default Navbar