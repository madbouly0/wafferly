'use client'

import React, { useRef, useState, useEffect } from 'react'

interface ProductCarouselProps {
    children: React.ReactNode
}

export default function ProductCarousel({ children }: ProductCarouselProps) {
    const scrollContainerRef = useRef<HTMLDivElement>(null)
    const [showLeftArrow, setShowLeftArrow] = useState(false)
    const [showRightArrow, setShowRightArrow] = useState(true)

    const handleScroll = () => {
        if (!scrollContainerRef.current) return
        const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
        setShowLeftArrow(scrollLeft > 0)
        // Add small tolerance (e.g. 2px) for rounding errors
        setShowRightArrow(Math.ceil(scrollLeft + clientWidth) < scrollWidth - 2)
    }

    useEffect(() => {
        handleScroll()
        window.addEventListener('resize', handleScroll)
        return () => window.removeEventListener('resize', handleScroll)
    }, [children])

    const scrollByAmount = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const scrollAmount = scrollContainerRef.current.clientWidth * 0.8
            scrollContainerRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            })
        }
    }

    return (
        <div style={{ position: 'relative', width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
            {/* Left Arrow */}
            <button
                onClick={() => scrollByAmount('left')}
                style={{
                    position: 'absolute',
                    left: '-20px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    zIndex: 10,
                    background: 'var(--color-white)',
                    border: '1px solid rgba(0,0,0,0.1)',
                    borderRadius: '50%',
                    width: '40px',
                    height: '40px',
                    display: showLeftArrow ? 'flex' : 'none',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: 'var(--shadow-sm)',
                    color: 'var(--color-dark)',
                    transition: 'all 0.2s ease',
                }}
                aria-label="Scroll left"
            >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
            </button>

            {/* Scroll Container */}
            <div
                ref={scrollContainerRef}
                onScroll={handleScroll}
                style={{
                    display: 'flex',
                    overflowX: 'auto',
                    scrollSnapType: 'x mandatory',
                    gap: '2rem',
                    paddingBottom: '2rem',
                    paddingTop: '1rem',
                    scrollbarWidth: 'none', // Firefox
                    msOverflowStyle: 'none', // IE/Edge
                    WebkitOverflowScrolling: 'touch', // iOS smooth scroll
                }}
                className="hide-scrollbar"
            >
                {React.Children.map(children, (child) => (
                    <div style={{ scrollSnapAlign: 'start', flex: '0 0 auto', width: '280px' }}>
                        {child}
                    </div>
                ))}
            </div>

            {/* Right Arrow */}
            <button
                onClick={() => scrollByAmount('right')}
                style={{
                    position: 'absolute',
                    right: '-20px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    zIndex: 10,
                    background: 'var(--color-white)',
                    border: '1px solid rgba(0,0,0,0.1)',
                    borderRadius: '50%',
                    width: '40px',
                    height: '40px',
                    display: showRightArrow ? 'flex' : 'none',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: 'var(--shadow-sm)',
                    color: 'var(--color-dark)',
                    transition: 'all 0.2s ease',
                }}
                aria-label="Scroll right"
            >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
            </button>

            <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
        </div>
    )
}
