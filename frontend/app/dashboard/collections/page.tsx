"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isLoggedIn, getSessionToken } from "@/lib/auth";
import { API_URL } from "@/lib/api";
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
                const cRes = await fetch(`${API_URL}/collections`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const cData = await cRes.json();

                // Fetch products to show inline
                const pRes = await fetch(`${API_URL}/dashboard`, {
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

    if (loading) {
        return (
            <div className="w-full min-h-screen bg-[#eff2f1] flex flex-col items-center justify-center">
                <div className="w-10 h-10 rounded-full border-4 border-[#dce5e4] border-t-[#3b5d50] animate-spin mb-4"></div>
                <div className="text-[#6a6a6a] font-inter text-sm font-medium">Loading collections...</div>
            </div>
        );
    }

    return (
        <div className="p-6 md:p-10 font-inter bg-[#eff2f1] min-h-screen">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
                    <div>
                        <div className="text-[#3b5d50] text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#3b5d50]"></span>
                            Organization
                        </div>
                        <h1 className="font-[Space_Grotesk] text-3xl md:text-4xl font-black text-[#2f2f2f] m-0 tracking-tight">
                            Your Collections
                        </h1>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {collections.map(col => (
                        <div key={col.id} className="flex flex-col gap-4 relative">
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
                                <div className="bg-white border border-[#dce5e4] rounded-[24px] p-6 animate-fade-in shadow-xl z-20 md:absolute md:top-[calc(100%+0.5rem)] md:left-0 md:w-full md:min-w-[320px]">
                                    <div className="flex justify-between items-center mb-5 pb-4 border-b border-[#eff2f1]">
                                        <h4 className="font-bold text-lg text-[#2f2f2f] font-[Space_Grotesk] m-0 tracking-tight">{col.name}</h4>
                                        <span className="bg-[#eff2f1] text-[#3b5d50] text-xs font-bold px-3 py-1 rounded-full border border-[#dce5e4]">{col.productCount} items</span>
                                    </div>

                                    {col.productCount === 0 ? (
                                        <div className="text-center py-8 bg-[#eff2f1]/50 rounded-xl border border-dashed border-[#dce5e4]">
                                            <p className="text-sm text-[#6a6a6a] font-medium max-w-[200px] mx-auto">Drop items here from the main dashboard to organize them.</p>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto pr-1">
                                            {products.filter(p => p.product.collectionId === col.id).map(p => (
                                                <a href={p.product.url} target="_blank" rel="noopener noreferrer" key={p.subscription_id} className="flex items-center gap-4 text-none p-3 rounded-xl transition-all duration-200 hover:bg-[#eff2f1] group border border-transparent hover:border-[#dce5e4]">
                                                    <div className="w-12 h-12 bg-white border border-[#eff2f1] rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0 shadow-sm transition-transform group-hover:scale-105">
                                                        <Image src={p.product.image} alt={p.product.title} width={36} height={36} className="object-contain p-1" />
                                                    </div>
                                                    <div className="flex-1 overflow-hidden">
                                                        <div className="text-sm font-semibold text-[#2f2f2f] whitespace-nowrap text-ellipsis overflow-hidden group-hover:text-[#3b5d50] transition-colors">{p.product.title}</div>
                                                        <div className="text-xs text-[#3b5d50] font-bold mt-1 bg-[#3b5d50]/10 inline-block px-2 py-0.5 rounded">{p.product.currency}{p.product.currentPrice.toLocaleString('en-IN')}</div>
                                                    </div>
                                                </a>
                                            ))}
                                        </div>
                                    )}

                                    <div className="mt-6 pt-5 border-t border-[#eff2f1] flex justify-end">
                                        <Link href={`/dashboard/collections/${col.id}`} className="inline-flex items-center gap-2 text-sm text-white bg-[#3b5d50] font-bold hover:bg-[#2d4a40] hover:shadow-md px-5 py-2.5 rounded-xl transition-all active:scale-95">
                                            Manage collection &rarr;
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {collections.length === 0 && (
                    <div className="flex flex-col items-center justify-center p-12 sm:p-20 bg-white rounded-[2rem] shadow-sm border border-[#dce5e4] mt-8 text-center max-w-3xl mx-auto">
                        <div className="w-24 h-24 bg-[#eff2f1] rounded-full flex items-center justify-center mb-6 text-[#3b5d50]">
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
                        </div>
                        <h3 className="font-[Space_Grotesk] text-2xl sm:text-3xl font-bold text-[#2f2f2f] mb-3">No collections yet</h3>
                        <p className="text-[#6a6a6a] max-w-md text-lg leading-relaxed mb-8">Use the sidebar to create your first collection and start organizing your tracked products beautifully.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
