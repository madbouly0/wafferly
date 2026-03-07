'use client'

import React, { useRef, useCallback } from 'react'

interface SpotlightGridProps {
    children: React.ReactNode
    className?: string
    spotlightColor?: string
}

/**
 * Single onMouseMove listener on the grid container.
 * Sets CSS custom properties that child SpotlightCards read via CSS.
 */
const SpotlightGrid = ({
    children,
    className = '',
    spotlightColor = 'rgba(249, 191, 41, 0.1)',
}: SpotlightGridProps) => {
    const gridRef = useRef<HTMLUListElement>(null)

    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLUListElement>) => {
        const grid = gridRef.current
        if (!grid) return

        // For each card child, calculate relative position
        const cards = grid.querySelectorAll<HTMLElement>('.spotlight-card')
        cards.forEach(card => {
            const rect = card.getBoundingClientRect()
            const x = e.clientX - rect.left
            const y = e.clientY - rect.top
            card.style.setProperty('--mouse-x', `${x}px`)
            card.style.setProperty('--mouse-y', `${y}px`)
            card.style.setProperty('--spotlight-color', spotlightColor)
        })
    }, [spotlightColor])

    const handleMouseLeave = useCallback(() => {
        const grid = gridRef.current
        if (!grid) return
        const cards = grid.querySelectorAll<HTMLElement>('.spotlight-card')
        cards.forEach(card => {
            card.style.setProperty('--spotlight-color', 'transparent')
        })
    }, [])

    return (
        <ul
            ref={gridRef}
            className={`products-grid spotlight-grid ${className}`}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            aria-label="Tracked products with current deals"
            style={{ maxWidth: '1200px', margin: '0 auto' }}
        >
            {children}
        </ul>
    )
}

export default SpotlightGrid
