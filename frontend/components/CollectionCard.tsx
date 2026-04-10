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
        <button
            onClick={onClick}
            type="button"
            aria-expanded={isExpanded}
            aria-controls={`collection-items-${id}`}
            className={`
                w-full text-left flex items-center p-5 gap-5 rounded-3xl border transition-all duration-300 hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-[#3b5d50] focus:ring-offset-2 group
                ${isExpanded
                    ? 'bg-[#3b5d50] border-[#3b5d50] shadow-lg'
                    : 'bg-white border-[#dce5e4] shadow-sm hover:shadow-md'
                }
            `}
        >
            {/* Collage Cover - 2x2 Grid */}
            <div className="w-[72px] h-[72px] shrink-0 grid grid-cols-2 grid-rows-2 gap-[2px] rounded-2xl overflow-hidden bg-[#eff2f1] shadow-inner">
                {displayImages.map((img, i) => (
                    <div key={i} className="bg-white flex items-center justify-center">
                        {img ? (
                            <Image src={img} alt="" width={36} height={36} className="object-cover w-full h-full" />
                        ) : (
                            <div className="bg-[#eff2f1] w-full h-full"></div>
                        )}
                    </div>
                ))}
            </div>

            {/* Info Area */}
            <div className="flex-1 min-w-0">
                <h3 className={`font-[Space_Grotesk] text-[1.1rem] font-bold mb-1 tracking-tight truncate transition-colors duration-300 ${isExpanded ? 'text-white' : 'text-[#2f2f2f]'}`}>
                    {name}
                </h3>
                <div className={`text-sm font-semibold ${isExpanded ? 'text-white/80' : 'text-[#6a6a6a]'}`}>
                    {productCount} {productCount === 1 ? 'item' : 'items'}
                </div>
            </div>

            {/* Expand chevron */}
            <div className={`
                w-[36px] h-[36px] rounded-full flex items-center justify-center transition-all duration-300 shrink-0
                ${isExpanded
                    ? 'bg-white/20 text-white rotate-180'
                    : 'bg-[#eff2f1] text-[#3b5d50] group-hover:bg-[#3b5d50]/10'
                }
            `}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </div>
        </button>
    );
}
