import React from 'react';
import Image from 'next/image';

interface CollectionCardProps {
    id: number;
    name: string;
    productCount: number;
    previewImages: string[];
    isExpanded: boolean;
    onClick: () => void;
}

export default function CollectionCard({ id, name, productCount, previewImages, isExpanded, onClick }: CollectionCardProps) {
    // Fill array up to 4 to ensure grid slots
    const images = [...previewImages];
    while (images.length < 4) {
        images.push("");
    }
    const displayImages = images.slice(0, 4);

    return (
        <div
            onClick={onClick}
            style={{
                background: isExpanded ? 'var(--color-primary)' : 'var(--color-white)',
                borderRadius: 'var(--radius-20)',
                border: isExpanded ? '1px solid var(--color-primary)' : '1px solid var(--color-light)',
                boxShadow: isExpanded ? 'var(--shadow-md)' : 'var(--shadow-sm)',
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                padding: '1rem',
                gap: '1.25rem'
            }}
            className="collection-card hover:-translate-y-1"
        >
            {/* Collage Cover - 2x2 Grid */}
            <div style={{
                width: '80px', height: '80px', flexShrink: 0,
                display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', gap: '2px',
                borderRadius: 'var(--radius-10)', overflow: 'hidden',
                background: 'var(--color-lighter)'
            }}>
                {displayImages.map((img, i) => (
                    <div key={i} style={{ background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {img ? (
                            <Image src={img} alt="preview" width={40} height={40} style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
                        ) : (
                            <div style={{ background: 'var(--color-lighter)', width: '100%', height: '100%' }}></div>
                        )}
                    </div>
                ))}
            </div>

            {/* Info Area */}
            <div style={{ flex: 1 }}>
                <h3 style={{
                    fontFamily: 'var(--font-spaceGrotesk)', fontSize: '1.1rem', fontWeight: 700,
                    color: isExpanded ? 'white' : 'var(--color-dark)', marginBottom: '4px',
                    transition: 'color 0.3s ease'
                }}>
                    {name}
                </h3>
                <div style={{
                    fontSize: '0.8rem', fontWeight: 600,
                    color: isExpanded ? 'rgba(255,255,255,0.8)' : 'var(--color-body)'
                }}>
                    {productCount} {productCount === 1 ? 'item' : 'items'}
                </div>
            </div>

            {/* Expand chevron */}
            <div style={{
                width: '32px', height: '32px', borderRadius: '50%',
                background: isExpanded ? 'rgba(255,255,255,0.2)' : 'var(--color-lighter)',
                color: isExpanded ? 'white' : 'var(--color-primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'all 0.3s ease'
            }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </div>
        </div>
    );
}
