'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState, Fragment } from 'react'
import { isLoggedIn, getUserEmail, getSessionToken, clearSession } from '@/lib/auth'
import { API_URL } from '@/lib/api'
import { Menu, Transition } from '@headlessui/react'

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/dashboard', label: 'Products' },
  { href: '/#about', label: 'About Us' },
]

const Navbar = () => {
  const pathname = usePathname()
  const router = useRouter()
  const [hasSession, setHasSession] = useState(false)
  const [emailInitials, setEmailInitials] = useState('')

  useEffect(() => {
    setHasSession(isLoggedIn())
    const email = getUserEmail()
    if (email) {
      setEmailInitials(email.substring(0, 2).toUpperCase())
    }
  }, [pathname])

  const handleLogout = async () => {
      try {
          const token = getSessionToken();
          if (token) {
              await fetch(`${API_URL}/auth/logout`, {
                  method: "POST",
                  headers: { Authorization: `Bearer ${token}` },
              });
          }
      } catch (e) {
          console.error("Logout error", e);
      } finally {
          clearSession();
          setHasSession(false);
          router.push("/");
      }
  };

  return (
    <nav className="nav" aria-label="Main navigation">

      {/* — Logo Section — */}
      <Link href="/" className="nav-logo" style={{ display: 'flex', alignItems: 'center', gap: '0', textDecoration: 'none' }}>
        <Image
          src="/assets/images/Gemini_Generated_Image_fmlfcafmlfcafmlf-removebg-preview.png"
          alt="Wafferly Symbol"
          width={50}
          height={50}
        />
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
        <li className="ml-2 relative">
          {hasSession ? (
            <Menu as="div" className="relative inline-block text-left">
              <div>
                <Menu.Button className="inline-flex w-full justify-center items-center gap-2 rounded-full border border-white/20 bg-white/5 pl-3 pr-4 py-1.5 text-sm font-medium text-white hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75 transition-colors shadow-sm">
                  <div className="w-6 h-6 rounded-full bg-[#E4BF57] flex items-center justify-center text-[#1e1e1e] text-[10px] font-bold font-[Space_Grotesk]">
                    {emailInitials ? emailInitials.charAt(0) : "U"}
                  </div>
                  Account
                  <svg className="w-4 h-4 text-white/70" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                  </svg>
                </Menu.Button>
              </div>
              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right divide-y divide-white/10 rounded-xl bg-[#2d4a40] shadow-lg ring-1 ring-black/5 focus:outline-none font-inter z-50 overflow-hidden border border-white/10">
                  <div className="px-1 py-1">
                    <Menu.Item>
                      {({ active }) => (
                        <Link
                          href="/dashboard"
                          className={`${
                            active ? 'bg-white/10 text-white' : 'text-white/80'
                          } group flex w-full items-center rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors`}
                        >
                          <svg className="mr-3 h-4 w-4 text-white/50 group-hover:text-white" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
                          </svg>
                          My Dashboard
                        </Link>
                      )}
                    </Menu.Item>
                  </div>
                  <div className="px-1 py-1">
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={handleLogout}
                          className={`${
                            active ? 'bg-red-500/20 text-red-300' : 'text-red-300/80'
                          } group flex w-full items-center rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors`}
                        >
                          <svg className="mr-3 h-4 w-4 text-red-400 group-hover:text-red-300" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
                          </svg>
                          Sign out
                        </button>
                      )}
                    </Menu.Item>
                  </div>
                </Menu.Items>
              </Transition>
            </Menu>
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