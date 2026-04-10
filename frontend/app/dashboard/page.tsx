"use client";

import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { API_URL } from "@/lib/api";
import { useDraggable } from "@dnd-kit/core";
import Searchbar from "@/components/Searchbar";
import ConfirmModal from "@/components/ConfirmModal";
import { useDashboard, TrackedProduct } from "@/contexts/DashboardContext";
import { IconTracking, IconSavings, IconLowestPrice, IconEmptyBag, IconTarget } from "@/components/icons";

// Helper component to make a product card draggable
function DraggableProductCard({ item, children, index }: { item: TrackedProduct, children: React.ReactNode, index: number }) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: `product-${item.product.id}`,
        data: item,
    });

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 999,
        opacity: 0.8,
    } : {
        animationDelay: `${index * 0.05}s`
    };

    return (
        <div
            ref={setNodeRef}
            {...listeners}
            {...attributes}
            className={`bg-white rounded-[20px] shadow-sm border border-[#dce5e4] overflow-hidden flex flex-col transition-all duration-200 hover:-translate-y-1 hover:shadow-md animate-[fadeUp_0.5s_ease_backwards] ${isDragging ? 'shadow-2xl z-50' : 'z-10'} relative`}
            style={style}
        >
            {children}
        </div>
    );
}

export default function DashboardPage() {
    const params = useParams();
    const { trackedProducts, loading, error, removeProductOptimistically } = useDashboard();
    
    // Unsubscribe Modal State
    const [confirmModalData, setConfirmModalData] = useState<{ isOpen: boolean; id: number | null; token: string | null }>({
        isOpen: false, id: null, token: null
    });

    const activeCollectionId = params?.id ? parseInt(params.id as string) : null;

    const displayedProducts = useMemo(() => {
        return trackedProducts.filter(p => p.product.collectionId === activeCollectionId);
    }, [trackedProducts, activeCollectionId]);

    const totalTracked = displayedProducts.length;
    const potentialSavings = displayedProducts.reduce((sum, item) => sum + (item.product.originalPrice - item.product.currentPrice), 0);
    const atLowestPrice = displayedProducts.filter(item => item.product.currentPrice <= item.product.lowestPrice * 1.02).length;

    // Standardize Currency (fallback to '$')
    const displayCurrency = displayedProducts.length > 0 ? displayedProducts[0].product.currency : '$';

    const triggerUnsubscribe = (id: number, token: string) => {
        setConfirmModalData({ isOpen: true, id, token });
    };

    const confirmUnsubscribe = async () => {
        const { id, token } = confirmModalData;
        if (!id || !token) return;

        try {
            // Optimistic update
            removeProductOptimistically(id);

            const res = await fetch(`${API_URL}/unsubscribe/${token}`);
            if (!res.ok) throw new Error("Failed to unsubscribe");
        } catch (err) {
            console.error("Unsubscribe error:", err);
            // Ideally a toast would show here
        }
    };

    if (loading) {
        return (
            <div className="w-full min-h-[60vh] bg-transparent flex flex-col items-center justify-center relative overflow-hidden">
                <div className="w-12 h-12 rounded-full border-4 border-[#3b5d50]/20 border-t-[#3b5d50] animate-spin mb-4 shadow-sm"></div>
                <div className="text-[#3b5d50]/70 font-inter text-sm font-bold tracking-widest uppercase">Syncing items...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#eff2f1] font-inter relative pb-20">
            {/* Header: Cleaned up avatar and duplicate search logic */}
            <header className="w-full bg-[#3b5d50] relative overflow-hidden px-8 pt-12 pb-32">
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle, white 1.5px, transparent 1.5px)', backgroundSize: '28px 28px' }}></div>
                
                <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8 h-full">
                    <div>
                        <div className="flex items-center gap-2 mb-4 text-sm text-white/50 font-medium">
                            <Link href="/" className="hover:text-white transition-colors">Home</Link>
                            <span>→</span>
                            <span className="text-white">Workspace</span>
                        </div>
                        <h1 className="text-white font-[Space_Grotesk] text-4xl sm:text-5xl font-bold m-0 leading-tight">
                            your profile
                        </h1>
                    </div>

                    <div className="w-full md:max-w-md">
                        <Searchbar />
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Redesigned Metrics Grid */}
                {trackedProducts.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 -mt-8 relative z-10 mb-6 max-w-3xl mx-auto">
                        <div className="bg-[#2d4a40] text-white p-2.5 sm:p-3 rounded-xl shadow-md border border-[#3b5d50] transform transition-transform hover:-translate-y-1">
                            <div className="text-white/60 text-[8px] font-semibold uppercase tracking-wider mb-1 flex items-center gap-1">
                                <IconTracking className="w-2.5 h-2.5" /> Actively Tracking
                            </div>
                            <div className="font-[Space_Grotesk] text-xl font-black mb-1 tracking-tight">{totalTracked}</div>
                            <p className="text-[8px] sm:text-[9px] text-white/70 leading-snug font-medium">Items monitored constantly. We'll alert you the moment a price drops.</p>
                        </div>

                        <div className="bg-[#f9bf29] text-[#2d4a40] p-2.5 sm:p-3 rounded-xl shadow-md border border-[#f8b810] transform transition-transform hover:-translate-y-1">
                            <div className="text-[#2d4a40]/60 text-[8px] font-semibold uppercase tracking-wider mb-1 flex items-center gap-1">
                                <IconSavings className="w-2.5 h-2.5" /> Potential Savings
                            </div>
                            <div className="font-[Space_Grotesk] text-xl font-black mb-1 tracking-tight">{displayCurrency}{potentialSavings.toLocaleString('en-US', {maximumFractionDigits: 0})}</div>
                            <p className="text-[8px] sm:text-[9px] text-[#2d4a40]/80 leading-snug font-medium">Total theoretical value saved if all tracked items are purchased right now.</p>
                        </div>

                        <div className="bg-white p-2.5 sm:p-3 rounded-xl shadow-md border border-[#dce5e4] transform transition-transform hover:-translate-y-1">
                            <div className="text-[#6a6a6a] text-[8px] font-semibold uppercase tracking-wider mb-1 flex items-center gap-1">
                                <IconLowestPrice className="w-2.5 h-2.5 text-[#3b5d50]" /> Actionable Deals
                            </div>
                            <div className="font-[Space_Grotesk] text-xl font-black text-[#3b5d50] mb-1 tracking-tight">{atLowestPrice}</div>
                            <p className="text-[8px] sm:text-[9px] text-[#6a6a6a] leading-snug font-medium">Items currently sitting at or incredibly close to historically low records.</p>
                        </div>
                    </div>
                )}

                {error ? (
                    <div className="bg-red-50 p-6 rounded-2xl text-red-700 border border-red-200 font-medium">
                        {error}
                    </div>
                ) : displayedProducts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-12 sm:p-20 bg-white rounded-[2rem] shadow-sm mt-8 border border-[#dce5e4]">
                        <div className="w-24 h-24 rounded-full bg-[#eff2f1] flex items-center justify-center mb-6 text-[#3b5d50]">
                            <IconEmptyBag />
                        </div>
                        <h3 className="font-[Space_Grotesk] text-2xl sm:text-3xl font-bold text-[#2f2f2f] mb-3 text-center">
                            {activeCollectionId ? "This collection is a blank canvas" : "You haven't tracked anything yet"}
                        </h3>
                        <p className="text-[#6a6a6a] mb-8 text-center max-w-md text-lg leading-relaxed">
                            {activeCollectionId ? "Drag and drop items from your main dashboard into this collection to organize them." : "Use the search bar above to paste an Amazon link. We'll monitor it for price changes."}
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Section Header */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-6">
                            <div>
                                <div className="text-[#3b5d50] text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#3b5d50]"></span>
                                    {activeCollectionId ? "Collection Items" : "Workspace"}
                                </div>
                                <h2 className="font-[Space_Grotesk] text-3xl sm:text-4xl font-bold text-[#2f2f2f] m-0 tracking-tight">
                                    {activeCollectionId ? "Collection Items" : "tracked Items"}
                                </h2>
                            </div>
                            <div className="flex items-center gap-4 w-full sm:w-auto">
                                <div className="bg-[#eff2f1] border border-[#dce5e4] px-5 py-2 rounded-full text-sm font-bold text-[#2f2f2f] shadow-sm whitespace-nowrap">
                                    {totalTracked} {totalTracked === 1 ? 'Item' : 'Items'}
                                </div>
                            </div>
                        </div>

                        {/* Product Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 auto-rows-fr">
                            {displayedProducts.map((item, i) => {
                                const isLowest = item.product.currentPrice <= item.product.lowestPrice * 1.02;
                                return (
                                    <DraggableProductCard key={item.subscription_id} item={item} index={i}>
                                        <div className="h-44 bg-gradient-to-br from-[#eff2f1] to-white relative flex items-center justify-center p-4 border-b border-[#eff2f1]">
                                            <Image src={item.product.image} alt={item.product.title} width={130} height={130} className="object-contain max-h-full drop-shadow-xl transition-transform duration-500 hover:scale-105 hover:-rotate-2" />
                                            {item.product.discountRate > 0 && (
                                                <div className="absolute top-4 left-4 bg-[#f9bf29] text-[#2d4a40] text-xs font-black px-3 py-1.5 rounded-full shadow-sm">
                                                    -{item.product.discountRate}%
                                                </div>
                                            )}
                                            {isLowest && (
                                                <div className="absolute top-4 right-4 bg-[#3b5d50] text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-sm uppercase tracking-wider">
                                                    Lowest ever
                                                </div>
                                            )}
                                        </div>

                                        <div className="p-5 flex flex-col flex-1 bg-white">
                                            <a href={item.product.url} target="_blank" rel="noopener noreferrer" className="no-underline group mb-1">
                                                <h3 className="font-inter text-xs font-semibold text-[#2f2f2f] leading-snug line-clamp-2 transition-colors group-hover:text-[#3b5d50]" title={item.product.title}>
                                                    {item.product.title}
                                                </h3>
                                            </a>

                                            <div className="flex items-center gap-2 mt-1 mb-4">
                                                <div className="font-[Space_Grotesk] text-lg font-black text-[#2f2f2f] leading-none tracking-tight">
                                                    {item.product.currency}{item.product.currentPrice.toLocaleString('en-US', {maximumFractionDigits: 0})}
                                                </div>
                                                {item.product.originalPrice > item.product.currentPrice && (
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] text-[#a0a0a0] line-through font-semibold">
                                                            {item.product.currency}{item.product.originalPrice.toLocaleString('en-US', {maximumFractionDigits: 0})}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="bg-[#eff2f1] border border-[#dce5e4]/50 rounded-xl p-3 flex justify-between items-center mb-4 shadow-inner">
                                                <div className="flex items-center gap-1.5 text-[10px] text-[#3b5d50] font-bold">
                                                    <IconTarget />
                                                    {item.target_price ? `${item.product.currency}${item.target_price.toLocaleString('en-IN')}` : "Any drop"}
                                                </div>
                                                <div className="bg-white text-[9px] font-bold text-[#6a6a6a] px-2 py-0.5 rounded-full shadow-sm">
                                                    ↓ {item.product.currency}{item.product.lowestPrice.toLocaleString('en-IN')}
                                                </div>
                                            </div>

                                            <div className="mt-auto pt-1">
                                                <div className="text-[9px] text-[#8a8a8a] mb-3 font-bold uppercase tracking-widest">
                                                    Tracking since {new Date(item.subscribed_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </div>
                                                <div className="flex gap-2">
                                                    <button onClick={() => triggerUnsubscribe(item.subscription_id, item.unsubscribe_token)} className="flex-1 py-2 rounded-lg border border-[#eff2f1] bg-transparent text-[#6a6a6a] text-[10px] font-bold hover:text-red-600 hover:border-red-100 hover:bg-red-50 transition-all focus:ring-1 focus:ring-red-200 outline-none">
                                                        Untrack
                                                    </button>
                                                    <a href={item.product.url} target="_blank" rel="noopener noreferrer" className="flex-1 py-2 rounded-lg border border-transparent bg-[#3b5d50] text-[#f9bf29] text-[10px] font-bold flex items-center justify-center hover:bg-[#2d4a40] hover:shadow-md transition-all focus:ring-1 focus:ring-[#3b5d50] outline-none">
                                                        Amazon ›
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    </DraggableProductCard>
                                );
                            })}
                        </div>
                    </>
                )}
            </main>

            <ConfirmModal 
                isOpen={confirmModalData.isOpen}
                onClose={() => setConfirmModalData({ isOpen: false, id: null, token: null })}
                onConfirm={confirmUnsubscribe}
                title="Stop tracking this item?"
                description="Are you sure you want to delete this track? You will no longer receive email alerts if the price drops."
                confirmText="Stop Tracking"
                isDestructive={true}
            />
        </div>
    );
}
