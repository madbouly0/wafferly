'use client'

import { motion } from 'framer-motion'

interface TextRevealProps {
    children: string
    className?: string
    as?: 'h1' | 'h2' | 'h3' | 'p' | 'span'
    delay?: number
    stagger?: number
    duration?: number
    id?: string
}

const lineVariants = {
    hidden: { y: '100%' },
    visible: (i: number) => ({
        y: '0%',
        transition: {
            duration: 0.8,
            ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
            delay: i * 0.12,
        },
    }),
}

/**
 * Cinematic line-by-line text reveal from overflow mask.
 * Splits text by newlines. Each line slides up from hidden overflow.
 */
export default function TextReveal({
    children,
    className = '',
    as: Tag = 'h1',
    delay = 0,
    stagger = 0.12,
    duration = 0.8,
    id,
}: TextRevealProps) {
    // Split by explicit newlines or treat as single line
    const lines = children.split('\n').filter(Boolean)

    return (
        <Tag className={`text-reveal ${className}`} id={id}>
            {lines.map((line, i) => (
                <span key={i} className="text-reveal-line">
                    <motion.span
                        className="text-reveal-inner"
                        custom={i}
                        initial="hidden"
                        animate="visible"
                        variants={{
                            hidden: { y: '100%' },
                            visible: {
                                y: '0%',
                                transition: {
                                    duration,
                                    ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
                                    delay: delay + i * stagger,
                                },
                            },
                        }}
                    >
                        {line}
                    </motion.span>
                </span>
            ))}
        </Tag>
    )
}
