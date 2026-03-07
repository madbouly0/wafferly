'use client'

import { motion } from 'framer-motion'

interface PageTransitionProps {
    children: React.ReactNode
}

const variants = {
    initial: {
        opacity: 0,
        y: 20,
        scale: 0.98,
    },
    enter: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            duration: 0.6,
            ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
        },
    },
    exit: {
        opacity: 0,
        y: -10,
        scale: 1.02,
        transition: {
            duration: 0.3,
            ease: [0.4, 0, 1, 1] as [number, number, number, number],
        },
    },
}

/**
 * Page transition wrapper for Next.js template.tsx.
 * Provides smooth enter/exit animations between routes.
 */
export default function PageTransition({ children }: PageTransitionProps) {
    return (
        <motion.div
            initial="initial"
            animate="enter"
            exit="exit"
            variants={variants}
        >
            {children}
        </motion.div>
    )
}
