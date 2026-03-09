"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { isLoggedIn, getSessionToken, getUserEmail, clearSession } from "@/lib/auth";

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
    };
};

export default function DashboardPage() {
    const router = useRouter();
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

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Dashboard Header */}
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                            <span className="text-3xl">🧇</span> Your Dashboard
                        </h1>
                        <p className="mt-1 text-sm text-gray-500">Welcome back, {userEmail}</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition"
                    >
                        Log out
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                {error ? (
                    <div className="bg-red-50 p-4 rounded-md border border-red-200 text-red-700">
                        {error}
                    </div>
                ) : trackedProducts.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100">
                        <div className="text-6xl mb-4">🛒</div>
                        <h3 className="text-xl font-medium text-gray-900 mb-2">You're not tracking any products yet.</h3>
                        <p className="text-gray-500 mb-6">Start tracking Amazon products to see them here.</p>
                        <Link
                            href="/"
                            className="inline-flex items-center px-6 py-3 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-green-700 hover:bg-green-800"
                        >
                            Find a Product
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {trackedProducts.map((item) => (
                            <div key={item.subscription_id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                                <div className="h-48 bg-white p-6 flex justify-center items-center relative border-b border-gray-100">
                                    <Image
                                        src={item.product.image}
                                        alt={item.product.title}
                                        width={200}
                                        height={200}
                                        className="max-h-full object-contain"
                                    />
                                    {item.product.discountRate > 0 && (
                                        <div className="absolute top-4 left-4 bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded">
                                            -{item.product.discountRate}% POST
                                        </div>
                                    )}
                                </div>

                                <div className="p-5 flex-grow flex flex-col">
                                    <a href={item.product.url} target="_blank" rel="noopener noreferrer" className="block mt-1 text-lg leading-tight font-medium text-gray-900 hover:text-green-700 hover:underline line-clamp-2 mb-2">
                                        {item.product.title}
                                    </a>

                                    <div className="mt-2 flex items-baseline gap-2">
                                        <span className="text-2xl font-bold text-gray-900">
                                            {item.product.currency}{item.product.currentPrice.toFixed(2)}
                                        </span>
                                        {item.product.originalPrice > item.product.currentPrice && (
                                            <span className="text-sm font-medium text-gray-500 line-through">
                                                {item.product.currency}{item.product.originalPrice.toFixed(2)}
                                            </span>
                                        )}
                                    </div>

                                    <div className="mt-4 bg-green-50 rounded-md p-3 border border-green-100">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-medium text-green-800">
                                                🎯 Target: {item.target_price ? `${item.product.currency}${item.target_price.toFixed(2)}` : "Any Drop"}
                                            </span>
                                            <span className="text-xs text-green-600 bg-white px-2 py-1 rounded shadow-sm">
                                                Lowest: {item.product.currency}{item.product.lowestPrice.toFixed(2)}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="mt-6 flex gap-3 pt-4 border-t border-gray-100 mt-auto">
                                        <button
                                            onClick={() => handleUnsubscribe(item.subscription_id, item.unsubscribe_token)}
                                            className="flex-1 px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-red-600 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                                        >
                                            Untrack
                                        </button>
                                        <a
                                            href={item.product.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex-1 text-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-colors"
                                        >
                                            Amazon ›
                                        </a>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
