"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isLoggedIn, getSessionToken } from "@/lib/auth";
import CollectionCard from "@/components/CollectionCard";
import Image from "next/image";
import Link from "next/link";

export default function CollectionsPage() {
    const router = useRouter();
    const [collections, setCollections] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [expandedId, setExpandedId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isLoggedIn()) {
            router.push("/auth/login");
            return;
        }

        const fetchAll = async () => {
            try {
                const token = getSessionToken();
                // Fetch collections
                const cRes = await fetch("http://localhost:5000/api/collections", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const cData = await cRes.json();

                // Fetch products to show inline
                const pRes = await fetch("http://localhost:5000/api/dashboard", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const pData = await pRes.json();

                setCollections(cData.data || []);
                setProducts(pData.tracked || []);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, [router]);

    if (loading) return <div style={{ padding: '2rem' }}>Loading collections...</div>;

    return (
        <div style={{ padding: '2.5rem', fontFamily: 'var(--font-inter)' }}>
            <h1 style={{ fontFamily: 'var(--font-spaceGrotesk)', fontSize: '2rem', fontWeight: 700, color: 'var(--color-dark)', marginBottom: '1.5rem' }}>
                Your Collections
            </h1>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                {collections.map(col => (
                    <div key={col.id} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <CollectionCard
                            id={col.id}
                            name={col.name}
                            productCount={col.productCount}
                            previewImages={col.previewImages}
                            isExpanded={expandedId === col.id}
                            onClick={() => setExpandedId(expandedId === col.id ? null : col.id)}
                        />

                        {/* Inline Expansion Area */}
                        {expandedId === col.id && (
                            <div style={{
                                background: 'white', border: '1px solid var(--color-light)', borderRadius: 'var(--radius-20)',
                                padding: '1.5rem', animation: 'fadeUp 0.3s ease', boxShadow: 'var(--shadow-sm)'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                    <h4 style={{ fontWeight: 600, color: 'var(--color-dark)', margin: 0 }}>{col.name}</h4>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--color-body)' }}>{col.productCount} items</span>
                                </div>

                                {col.productCount === 0 ? (
                                    <p style={{ fontSize: '0.85rem', color: 'var(--color-body)' }}>No items in this collection. Drag items here from the All Items view to organize them.</p>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                        {products.filter(p => p.product.collectionId === col.id).map(p => (
                                            <a href={p.product.url} target="_blank" rel="noopener noreferrer" key={p.subscription_id} style={{
                                                display: 'flex', alignItems: 'center', gap: '1rem', textDecoration: 'none',
                                                padding: '0.5rem', borderRadius: 'var(--radius-10)', transition: 'background 0.2s'
                                            }} className="hover:bg-gray-50">
                                                <div style={{ width: '40px', height: '40px', background: 'var(--color-lighter)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                                    <Image src={p.product.image} alt={p.product.title} width={32} height={32} style={{ objectFit: 'contain' }} />
                                                </div>
                                                <div style={{ flex: 1, overflow: 'hidden' }}>
                                                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-dark)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{p.product.title}</div>
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: 600 }}>{p.product.currency}{p.product.currentPrice.toLocaleString('en-IN')}</div>
                                                </div>
                                            </a>
                                        ))}
                                    </div>
                                )}

                                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--color-light)' }}>
                                    <Link href={`/dashboard/collections/${col.id}`} style={{ fontSize: '0.85rem', color: 'var(--color-dark)', fontWeight: 600, textDecoration: 'underline' }}>
                                        View full dashboard &rarr;
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
            {collections.length === 0 && (
                <div style={{ color: 'var(--color-body)', fontSize: '0.9rem' }}>No collections yet. Use the sidebar to create one!</div>
            )}
        </div>
    );
}
