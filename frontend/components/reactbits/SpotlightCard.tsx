'use client'

import React from 'react'
import './SpotlightCard.css'

interface SpotlightCardProps extends React.PropsWithChildren {
    className?: string
}

/**
 * A card that reads --mouse-x and --mouse-y CSS vars 
 * set by the parent SpotlightGrid. No own mouse listener.
 */
const SpotlightCard: React.FC<SpotlightCardProps> = ({
    children,
    className = '',
}) => {
    return (
        <div className={`spotlight-card ${className}`}>
            {children}
        </div>
    )
}

export default SpotlightCard
