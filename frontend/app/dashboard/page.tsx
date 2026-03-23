"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { isLoggedIn, getSessionToken, getUserEmail, clearSession } from "@/lib/auth";
import { useDraggable } from "@dnd-kit/core";

type TrackedProduct = {
    subscription_id: number;
    target_price: number | null;
    unsubscribe_token: string;
    subscribed_at: string;
    product: {
        id: number;
        title: string;
        image: string;
        url: string;
        currency: string;
        currentPrice: number;
        originalPrice: number;
        discountRate: number;
        lowestPrice: number;
        priceHistory: { price: number; recordedAt: string }[];
        collectionId: number | null;
    };
};

// Helper component to make a product card draggable
function DraggableProductCard({ item, children, index }: { item: TrackedProduct, children: React.ReactNode, index: number }) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: `product-${item.product.id}`,
        data: item,
    });

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 999, // bring to front when dragging
        opacity: 0.8,
    } : {
        animationDelay: `${index * 0.05}s`
    };

    return (
        <div
            ref={setNodeRef}
            {...listeners}
            {...attributes}
            className={`product-card ${isDragging ? 'shadow-2xl' : ''}`}
            style={style}
        >
            {children}
        </div>
    );
}

export default function DashboardPage() {
    const router = useRouter();
    const params = useParams();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [trackedProducts, setTrackedProducts] = useState<TrackedProduct[]>([]);
    const userEmail = getUserEmail();

    useEffect(() => {
        // Redirect if not logged in
        if (!isLoggedIn()) {
            router.push("/auth/login");
            return;
        }

        const fetchDashboard = async () => {
            try {
                const token = getSessionToken();
                const res = await fetch("http://localhost:5000/api/dashboard", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!res.ok) {
                    if (res.status === 401) {
                        clearSession();
                        router.push("/auth/login");
                        return;
                    }
                    throw new Error("Failed to load dashboard");
                }

                const data = await res.json();
                setTrackedProducts(data.tracked || []);
            } catch (err: any) {
                console.error("Dashboard error:", err);
                setError(err.message || "Could not load your tracked products");
            } finally {
                setLoading(false);
            }
        };

        fetchDashboard();

        // Listen for dashboard changes (e.g., from drag and drop) to refetch items
        const handleDashboardChanged = () => fetchDashboard();
        window.addEventListener("dashboard:changed", handleDashboardChanged);

        return () => window.removeEventListener("dashboard:changed", handleDashboardChanged);
    }, [router]);

    const handleLogout = async () => {
        try {
            const token = getSessionToken();
            if (token) {
                await fetch("http://localhost:5000/api/auth/logout", {
                    method: "POST",
                    headers: { Authorization: `Bearer ${token}` },
                });
            }
        } catch (e) {
            console.error("Logout error", e);
        } finally {
            clearSession();
            router.push("/");
        }
    };

    const handleUnsubscribe = async (subscriptionId: number, token: string) => {
        if (!confirm("Are you sure you want to stop tracking this product?")) return;

        try {
            const res = await fetch(`http://localhost:5000/api/unsubscribe/${token}`);
            if (!res.ok) throw new Error("Failed to unsubscribe");

            // Remove from state immediately
            setTrackedProducts(prev => prev.filter(p => p.subscription_id !== subscriptionId));
        } catch (err) {
            console.error("Unsubscribe error:", err);
            alert("Failed to unsubscribe. Please try again.");
        }
    };

    // Filter products based on current view
    // If params.id exists, show that collection. Otherwise show unassigned ("All Items")
    const activeCollectionId = params?.id ? parseInt(params.id as string) : null;

    const displayedProducts = useMemo(() => {
        return trackedProducts.filter(p => p.product.collectionId === activeCollectionId);
    }, [trackedProducts, activeCollectionId]);

    // Calculate stats based on displayed products
    const totalTracked = displayedProducts.length;
    const potentialSavings = displayedProducts.reduce((sum, item) => sum + (item.product.originalPrice - item.product.currentPrice), 0);
    const atLowestPrice = displayedProducts.filter(item => item.product.currentPrice <= item.product.lowestPrice * 1.02).length;

    if (loading) {
        return (
            <div className="w-full min-h-screen relative overflow-hidden" style={{ background: 'var(--color-primary)' }}>
                <style dangerouslySetInnerHTML={{
                    __html: `
                    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                `}} />
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{
                        width: '3rem', height: '3rem', borderRadius: '50%',
                        border: '3px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--color-secondary)',
                        animation: 'spin 1s linear infinite', marginBottom: '1rem'
                    }}></div>
                    <div style={{ color: 'rgba(255,255,255,0.6)', fontFamily: 'var(--font-inter)', fontSize: '0.9rem' }}>Loading your profile...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen relative" style={{ background: 'var(--color-lighter)', fontFamily: 'var(--font-inter)' }}>
            <style dangerouslySetInnerHTML={{
                __html: `
                .shimmer {
                    animation: shimmer 1.5s infinite linear;
                    background: linear-gradient(90deg, var(--color-light) 0%, rgba(255,255,255,0.5) 50%, var(--color-light) 100%);
                    background-size: 200% 100%;
                }
                @keyframes shimmer { 0% { background-position: 100% 0; } 100% { background-position: -100% 0; } }
                @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                
                .product-card {
                    background: var(--color-white); border-radius: var(--radius-20);
                    box-shadow: var(--shadow-sm); border: 1px solid var(--color-light);
                    overflow: hidden; display: flex; flex-direction: column;
                    transition: all 0.2s ease; animation: fadeUp 0.5s ease backwards;
                }
                .product-card:hover { transform: translateY(-3px); box-shadow: var(--shadow-md); }
                .card-title { font-family: var(--font-inter); font-size: 0.875rem; font-weight: 600; color: var(--color-dark); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; transition: color 0.2s; }
                .product-card:hover .card-title { color: var(--color-primary); }
                
                .btn-pill { display: inline-flex; justify-content: center; align-items: center; padding: 0.5rem 1rem; border-radius: var(--radius-30); font-weight: 600; font-size: 0.85rem; transition: all 0.2s; border: none; cursor: pointer; text-decoration: none; }
                .btn-track { background: var(--color-primary); color: white; flex: 1; }
                .btn-track:hover { background: var(--color-primary-dark); }
                .btn-untrack { background: transparent; color: var(--color-body); border: 1px solid var(--color-light); flex: 1; }
                .btn-untrack:hover { color: var(--color-error); border-color: rgba(220,53,69,0.3); background: rgba(220,53,69,0.05); }
            `}} />

            {/* Hero Header */}
            <header style={{
                width: '100%', background: 'var(--color-primary)', position: 'relative', overflow: 'hidden',
                paddingTop: '6rem', paddingBottom: '8rem', paddingLeft: '2rem', paddingRight: '2rem'
            }}>
                <div style={{
                    position: 'absolute', inset: 0,
                    backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.06) 1.5px, transparent 1.5px)',
                    backgroundSize: '28px 28px', pointerEvents: 'none'
                }}></div>

                <div className="max-w-7xl mx-auto relative z-10">
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '2rem', fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)' }}>
                        <Link href="/" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>Home</Link>
                        <span>→</span>
                        <span style={{ color: 'white' }}>Profile</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                            <div style={{
                                width: '64px', height: '64px', borderRadius: '50%', background: 'var(--color-secondary)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: 'var(--color-dark)', fontSize: '1.8rem', fontWeight: 800, fontFamily: 'var(--font-spaceGrotesk)'
                            }}>
                                {userEmail?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div>
                                <div style={{ color: 'var(--color-secondary)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Your profile</div>
                                <h1 style={{ color: 'white', fontFamily: 'var(--font-spaceGrotesk)', fontSize: '2rem', fontWeight: 700, margin: 0, lineHeight: 1.1 }}>
                                    {userEmail?.split('@')[0]}
                                </h1>
                                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', marginTop: '0.2rem' }}>{userEmail}</div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <Link href="/" style={{
                                display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px',
                                borderRadius: 'var(--radius-30)', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
                                color: 'white', fontWeight: 600, fontSize: '0.9rem', textDecoration: 'none', backdropFilter: 'blur(10px)'
                            }}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                                Track product
                            </Link>
                            <button onClick={handleLogout} style={{
                                display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px',
                                borderRadius: 'var(--radius-30)', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)',
                                color: 'rgba(255,255,255,0.8)', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer'
                            }}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                                Sign out
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">

                {/* Stats Strip */}
                {trackedProducts.length > 0 && (
                    <div style={{
                        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem',
                        marginTop: '-3rem', position: 'relative', zIndex: 2, marginBottom: '3rem'
                    }}>
                        <div style={{ background: 'white', borderRadius: 'var(--radius-20)', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--color-light)' }}>
                            <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-10)', background: 'rgba(59,93,80,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)' }}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                            </div>
                            <div>
                                <div style={{ color: 'var(--color-body)', fontSize: '0.8rem', fontWeight: 500, marginBottom: '2px' }}>Tracking</div>
                                <div style={{ color: 'var(--color-dark)', fontSize: '1.4rem', fontWeight: 700, fontFamily: 'var(--font-spaceGrotesk)' }}>{totalTracked} items</div>
                            </div>
                        </div>
                        <div style={{ background: 'white', borderRadius: 'var(--radius-20)', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--color-light)' }}>
                            <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-10)', background: 'rgba(59,93,80,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)' }}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                            </div>
                            <div>
                                <div style={{ color: 'var(--color-body)', fontSize: '0.8rem', fontWeight: 500, marginBottom: '2px' }}>Potential savings</div>
                                <div style={{ color: 'var(--color-dark)', fontSize: '1.4rem', fontWeight: 700, fontFamily: 'var(--font-spaceGrotesk)' }}>₹{potentialSavings.toLocaleString('en-IN')}</div>
                            </div>
                        </div>
                        <div style={{ background: 'white', borderRadius: 'var(--radius-20)', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--color-light)' }}>
                            <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-10)', background: 'rgba(59,93,80,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)' }}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 17 13.5 8.5 8.5 13.5 2 7"></polyline><polyline points="16 17 22 17 22 11"></polyline></svg>
                            </div>
                            <div>
                                <div style={{ color: 'var(--color-body)', fontSize: '0.8rem', fontWeight: 500, marginBottom: '2px' }}>At lowest price</div>
                                <div style={{ color: 'var(--color-dark)', fontSize: '1.4rem', fontWeight: 700, fontFamily: 'var(--font-spaceGrotesk)' }}>{atLowestPrice} deals</div>
                            </div>
                        </div>
                    </div>
                )}

                {error ? (
                    <div style={{ background: 'rgba(220,53,69,0.1)', padding: '1rem', borderRadius: 'var(--radius-10)', color: 'var(--color-error)', border: '1px solid rgba(220,53,69,0.3)' }}>
                        {error}
                    </div>
                ) : displayedProducts.length === 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 1rem', background: 'white', borderRadius: 'var(--radius-20)', boxShadow: 'var(--shadow-sm)', marginTop: '2rem', border: '1px solid var(--color-light)' }}>
                        <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--color-lighter)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', color: 'var(--color-primary)' }}>
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                        </div>
                        <h3 style={{ fontFamily: 'var(--font-spaceGrotesk)', fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-dark)', marginBottom: '0.5rem' }}>
                            {activeCollectionId ? "No products in this collection" : "All your products are assigned to collections"}
                        </h3>
                        <p style={{ color: 'var(--color-body)', marginBottom: '2rem', textAlign: 'center' }}>
                            {activeCollectionId ? "Drag and drop items from All Items here." : "Track more products to see them here, or view your collections."}
                        </p>
                        {!activeCollectionId && (
                            <Link href="/" className="btn-pill btn-track" style={{ padding: '0.8rem 2rem', fontSize: '1rem' }}>
                                Track new product
                            </Link>
                        )}
                    </div>
                ) : (
                    <>
                        {/* Section Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem' }}>
                            <div>
                                <div style={{ color: 'var(--color-primary)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-primary)' }}></span>
                                    {activeCollectionId ? "Collection Items" : "Tracked products"}
                                </div>
                                <h2 style={{ fontFamily: 'var(--font-spaceGrotesk)', fontSize: '1.8rem', fontWeight: 700, color: 'var(--color-dark)', margin: 0 }}>
                                    {activeCollectionId ? "Collection Items" : "Unassigned Items"}
                                </h2>
                            </div>
                            <div style={{ background: 'var(--color-lighter)', border: '1px solid var(--color-light)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-dark)' }}>
                                {totalTracked} {totalTracked === 1 ? 'Item' : 'Items'}
                            </div>
                        </div>

                        {/* Product Grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                            {displayedProducts.map((item, i) => {
                                const isLowest = item.product.currentPrice <= item.product.lowestPrice * 1.02;
                                return (
                                    <DraggableProductCard key={item.subscription_id} item={item} index={i}>
                                        {/* Image Area */}
                                        <div style={{ height: '200px', background: 'var(--color-lighter)', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                                            <Image src={item.product.image} alt={item.product.title} width={160} height={160} style={{ objectFit: 'contain', maxHeight: '100%' }} />

                                            {item.product.discountRate > 0 && (
                                                <div style={{ position: 'absolute', top: '12px', left: '12px', background: 'var(--color-secondary)', color: 'var(--color-dark)', fontSize: '0.75rem', fontWeight: 800, padding: '4px 8px', borderRadius: '20px', boxShadow: 'var(--shadow-sm)' }}>
                                                    -{item.product.discountRate}%
                                                </div>
                                            )}

                                            {isLowest && (
                                                <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'var(--color-primary)', color: 'white', fontSize: '0.7rem', fontWeight: 600, padding: '4px 10px', borderRadius: '20px', boxShadow: 'var(--shadow-sm)' }}>
                                                    Lowest ever
                                                </div>
                                            )}
                                        </div>

                                        {/* Content Area */}
                                        <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                                            <a href={item.product.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                                                <h3 className="card-title" title={item.product.title}>{item.product.title}</h3>
                                            </a>

                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px', marginBottom: '16px' }}>
                                                <div style={{ fontFamily: 'var(--font-spaceGrotesk)', fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-dark)', lineHeight: 1 }}>
                                                    {item.product.currency}{item.product.currentPrice.toLocaleString('en-IN')}
                                                </div>
                                                {item.product.originalPrice > item.product.currentPrice && (
                                                    <>
                                                        <div style={{ fontSize: '0.85rem', color: 'var(--color-body)', textDecoration: 'line-through', fontWeight: 500 }}>
                                                            {item.product.currency}{item.product.originalPrice.toLocaleString('en-IN')}
                                                        </div>
                                                        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-primary)', background: 'rgba(59,93,80,0.08)', padding: '2px 6px', borderRadius: '4px' }}>
                                                            saving ₹{(item.product.originalPrice - item.product.currentPrice).toLocaleString('en-IN')}
                                                        </div>
                                                    </>
                                                )}
                                            </div>

                                            <div style={{ background: 'var(--color-lighter)', borderRadius: 'var(--radius-10)', padding: '10px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--color-primary)', fontWeight: 600 }}>
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>
                                                    {item.target_price ? `${item.product.currency}${item.target_price.toLocaleString('en-IN')}` : "Any drop"}
                                                </div>
                                                <div style={{ background: 'white', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-body)', padding: '2px 8px', borderRadius: '12px', boxShadow: 'var(--shadow-sm)' }}>
                                                    ↓ {item.product.currency}{item.product.lowestPrice.toLocaleString('en-IN')}
                                                </div>
                                            </div>

                                            <div style={{ marginTop: 'auto' }}>
                                                <div style={{ fontSize: '0.7rem', color: 'var(--color-body)', marginBottom: '12px', fontWeight: 500 }}>
                                                    Tracking since {new Date(item.subscribed_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </div>
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    <button onClick={() => handleUnsubscribe(item.subscription_id, item.unsubscribe_token)} className="btn-pill btn-untrack">
                                                        Untrack
                                                    </button>
                                                    <a href={item.product.url} target="_blank" rel="noopener noreferrer" className="btn-pill btn-track">
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
        </div>
    );
}
