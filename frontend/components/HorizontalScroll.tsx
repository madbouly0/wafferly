'use client'

import React, { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

interface HorizontalScrollProps {
    children: React.ReactNode
    className?: string
}

/**
 * Horizontal scroll section. Uses framer-motion useScroll + useTransform
 * to translate a container horizontally as the user scrolls vertically.
 * The section is pinned for the duration of the horizontal scroll.
 */
export default function HorizontalScroll({ children, className = '' }: HorizontalScrollProps) {
    const sectionRef = useRef<HTMLDivElement>(null)
    const scrollContainerRef = useRef<HTMLDivElement>(null)

    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ['start start', 'end end'],
    })

    // Map vertical scroll progress to horizontal translation
    const x = useTransform(scrollYProgress, [0, 1], ['0%', '-65%'])

    return (
        <section
            ref={sectionRef}
            className={`horizontal-scroll-section ${className}`}
        >
            <div className="horizontal-scroll-sticky">
                <motion.div
                    ref={scrollContainerRef}
                    className="horizontal-scroll-track"
                    style={{ x }}
                >
                    {children}
                </motion.div>
            </div>
        </section>
    )
}

/**
 * Card with parallax image offset.
 * The image translates slightly slower than the card for a 3D depth feel.
 */
export function ParallaxCard({
    children,
    index,
}: {
    children: React.ReactNode
    index: number
}) {
    const cardRef = useRef<HTMLDivElement>(null)

    const { scrollYProgress } = useScroll({
        target: cardRef,
        offset: ['start end', 'end start'],
    })

    const imgX = useTransform(scrollYProgress, [0, 1], [30, -30])

    return (
        <motion.div
            ref={cardRef}
            className="horizontal-card"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{
                duration: 0.6,
                ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
                delay: index * 0.08,
            }}
        >
            <motion.div className="horizontal-card-img-wrap" style={{ x: imgX }}>
                {children}
            </motion.div>
        </motion.div>
    )
}
