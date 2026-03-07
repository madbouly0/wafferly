'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

interface FilterTabsProps {
    tabs: string[]
    activeTab: string
    onTabChange: (tab: string) => void
}

const FilterTabs = ({ tabs, activeTab, onTabChange }: FilterTabsProps) => {
    return (
        <div className="filter-tabs" role="tablist" aria-label="Filter products">
            {tabs.map((tab) => (
                <button
                    key={tab}
                    role="tab"
                    aria-selected={activeTab === tab}
                    className={`filter-tab ${activeTab === tab ? 'active' : ''}`}
                    onClick={() => onTabChange(tab)}
                >
                    {activeTab === tab && (
                        <motion.span
                            className="filter-tab-pill"
                            layoutId="active-pill"
                            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                        />
                    )}
                    <span className="filter-tab-label">{tab}</span>
                </button>
            ))}
        </div>
    )
}

export default FilterTabs
