'use client'

import { useEffect, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

interface BlobCursorProps {
    fillColor?: string
    opacity?: number
    size?: number
}

const BlobCursor = ({
    fillColor = '#f9bf29',
    opacity = 0.15,
    size = 300,
}: BlobCursorProps) => {
    const [canRender, setCanRender] = useState(false)
    const mouseX = useMotionValue(-size)
    const mouseY = useMotionValue(-size)

    // Smooth spring follow
    const springX = useSpring(mouseX, { stiffness: 120, damping: 25, mass: 0.5 })
    const springY = useSpring(mouseY, { stiffness: 120, damping: 25, mass: 0.5 })

    useEffect(() => {
        // Only render on devices with a fine pointer (not touch / mobile)
        const mq = window.matchMedia('(pointer: fine)')
        setCanRender(mq.matches)

        const handleChange = (e: MediaQueryListEvent) => setCanRender(e.matches)
        mq.addEventListener('change', handleChange)

        return () => mq.removeEventListener('change', handleChange)
    }, [])

    useEffect(() => {
        if (!canRender) return

        const handleMouseMove = (e: MouseEvent) => {
            mouseX.set(e.clientX - size / 2)
            mouseY.set(e.clientY - size / 2)
        }

        window.addEventListener('mousemove', handleMouseMove, { passive: true })
        return () => window.removeEventListener('mousemove', handleMouseMove)
    }, [canRender, mouseX, mouseY, size])

    if (!canRender) return null

    return (
        <motion.div
            className="blob-cursor"
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: size,
                height: size,
                borderRadius: '50%',
                background: `radial-gradient(circle, ${fillColor} 0%, transparent 70%)`,
                opacity,
                pointerEvents: 'none',
                zIndex: 9999,
                x: springX,
                y: springY,
                willChange: 'transform',
                mixBlendMode: 'screen',
            }}
            aria-hidden="true"
        />
    )
}

export default BlobCursor
