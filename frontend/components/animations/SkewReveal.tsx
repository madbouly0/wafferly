'use client'

import { motion } from 'framer-motion'

interface SkewRevealProps {
    children: React.ReactNode
    delay?: number
    className?: string
}

/**
 * whileInView wrapper: slides up + skews from 2deg to 0deg.
 * Used for the "Why Choose Us" feature cards.
 */
export default function SkewReveal({ children, delay = 0, className = '' }: SkewRevealProps) {
    return (
        <motion.div
            className={className}
            initial={{ opacity: 0, y: 60, skewY: 2 }}
            whileInView={{
                opacity: 1,
                y: 0,
                skewY: 0,
                transition: {
                    duration: 0.7,
                    ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
                    delay,
                },
            }}
            viewport={{ once: true, amount: 0.2 }}
        >
            {children}
        </motion.div>
    )
}
