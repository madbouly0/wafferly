'use client'

import React, { useRef, useState, useCallback } from 'react'

interface GlareHoverProps {
    children: React.ReactNode
    glareColor?: string
    glareOpacity?: number
    transitionDuration?: number
    className?: string
}

const GlareHover = ({
    children,
    glareColor = '#ffffff',
    glareOpacity = 0.2,
    transitionDuration = 400,
    className = '',
}: GlareHoverProps) => {
    const ref = useRef<HTMLDivElement>(null)
    const [glarePos, setGlarePos] = useState({ x: 50, y: 50 })
    const [tilt, setTilt] = useState({ x: 0, y: 0 })
    const [isHovering, setIsHovering] = useState(false)

    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (!ref.current) return
        const rect = ref.current.getBoundingClientRect()
        const x = ((e.clientX - rect.left) / rect.width) * 100
        const y = ((e.clientY - rect.top) / rect.height) * 100
        setGlarePos({ x, y })
        setTilt({
            x: ((y - 50) / 50) * -6, // subtle tilt
            y: ((x - 50) / 50) * 6,
        })
    }, [])

    const handleMouseEnter = useCallback(() => setIsHovering(true), [])
    const handleMouseLeave = useCallback(() => {
        setIsHovering(false)
        setTilt({ x: 0, y: 0 })
    }, [])

    return (
        <div
            ref={ref}
            className={`glare-hover-wrap ${className}`}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            style={{
                perspective: '800px',
            }}
        >
            <div
                className="glare-hover-inner"
                style={{
                    transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
                    transition: `transform ${transitionDuration}ms ease-out`,
                    position: 'relative',
                    overflow: 'hidden',
                    borderRadius: 'inherit',
                }}
            >
                {children}
                {/* Glare overlay */}
                <div
                    className="glare-hover-glare"
                    style={{
                        position: 'absolute',
                        inset: 0,
                        pointerEvents: 'none',
                        opacity: isHovering ? glareOpacity : 0,
                        background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, ${glareColor} 0%, transparent 60%)`,
                        transition: `opacity ${transitionDuration}ms ease`,
                        zIndex: 10,
                    }}
                />
            </div>
        </div>
    )
}

export default GlareHover
