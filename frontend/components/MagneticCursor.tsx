'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

const MAGNETIC_SELECTORS = '.btn, nav a, .product-card, .filter-tab, .navbar-logo, .footer-logo'
const SPRING_CONFIG = { stiffness: 150, damping: 15, mass: 0.2 }

export default function MagneticCursor() {
    const [canRender, setCanRender] = useState(false)
    const [isHovering, setIsHovering] = useState(false)
    const isHoveringRef = useRef(false)

    const mouseX = useMotionValue(-100)
    const mouseY = useMotionValue(-100)
    const dotX = useSpring(mouseX, SPRING_CONFIG)
    const dotY = useSpring(mouseY, SPRING_CONFIG)

    // Ring follows with softer spring
    const ringX = useSpring(mouseX, { stiffness: 80, damping: 20, mass: 0.5 })
    const ringY = useSpring(mouseY, { stiffness: 80, damping: 20, mass: 0.5 })

    useEffect(() => {
        const mq = window.matchMedia('(pointer: fine)')
        setCanRender(mq.matches)
        const handleChange = (e: MediaQueryListEvent) => setCanRender(e.matches)
        mq.addEventListener('change', handleChange)
        return () => mq.removeEventListener('change', handleChange)
    }, [])

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (isHoveringRef.current) return // magnetic snap overrides
        mouseX.set(e.clientX)
        mouseY.set(e.clientY)
    }, [mouseX, mouseY])

    const handleMouseOver = useCallback((e: MouseEvent) => {
        const target = (e.target as HTMLElement).closest?.(MAGNETIC_SELECTORS)
        if (target) {
            isHoveringRef.current = true
            setIsHovering(true)
            const rect = target.getBoundingClientRect()
            mouseX.set(rect.left + rect.width / 2)
            mouseY.set(rect.top + rect.height / 2)
        }
    }, [mouseX, mouseY])

    const handleMouseOut = useCallback((e: MouseEvent) => {
        const target = (e.target as HTMLElement).closest?.(MAGNETIC_SELECTORS)
        if (target) {
            isHoveringRef.current = false
            setIsHovering(false)
        }
    }, [])

    useEffect(() => {
        if (!canRender) return
        window.addEventListener('mousemove', handleMouseMove, { passive: true })
        document.addEventListener('mouseover', handleMouseOver, { passive: true })
        document.addEventListener('mouseout', handleMouseOut, { passive: true })
        return () => {
            window.removeEventListener('mousemove', handleMouseMove)
            document.removeEventListener('mouseover', handleMouseOver)
            document.removeEventListener('mouseout', handleMouseOut)
        }
    }, [canRender, handleMouseMove, handleMouseOver, handleMouseOut])

    if (!canRender) return null

    return (
        <>
            {/* Dot */}
            <motion.div
                className="cursor-dot"
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: 'var(--color-secondary)',
                    pointerEvents: 'none',
                    zIndex: 99999,
                    x: dotX,
                    y: dotY,
                    translateX: '-50%',
                    translateY: '-50%',
                    scale: isHovering ? 0 : 1,
                }}
                aria-hidden="true"
            />
            {/* Ring */}
            <motion.div
                className="cursor-ring"
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: isHovering ? 56 : 32,
                    height: isHovering ? 56 : 32,
                    borderRadius: '50%',
                    border: isHovering ? '1.5px solid var(--color-secondary)' : '1.5px solid var(--color-dark)',
                    background: isHovering ? 'rgba(249, 191, 41, 0.08)' : 'transparent',
                    pointerEvents: 'none',
                    zIndex: 99998,
                    x: ringX,
                    y: ringY,
                    translateX: '-50%',
                    translateY: '-50%',
                    transition: 'width 0.3s ease, height 0.3s ease, border 0.3s ease, background 0.3s ease',
                }}
                aria-hidden="true"
            />
        </>
    )
}
