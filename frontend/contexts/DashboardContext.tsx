"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { getSessionToken, isLoggedIn } from "@/lib/auth";
import { API_URL } from "@/lib/api";

export type TrackedProduct = {
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

export type Collection = {
    id: number;
    name: string;
    productCount: number;
};

type DashboardContextType = {
    trackedProducts: TrackedProduct[];
    collections: Collection[];
    loading: boolean;
    error: string | null;
    refreshDashboard: () => Promise<void>;
    moveProductToCollection: (productId: number, collectionId: number | null) => Promise<void>;
    removeProductOptimistically: (subscriptionId: number) => void;
};

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: ReactNode }) {
    const [trackedProducts, setTrackedProducts] = useState<TrackedProduct[]>([]);
    const [collections, setCollections] = useState<Collection[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refreshDashboard = useCallback(async () => {
        if (!isLoggedIn()) {
            setLoading(false);
            return;
        }

        try {
            const token = getSessionToken();
            
            // Provide dual fetching seamlessly via promise.all
            const [dashRes, colRes] = await Promise.all([
                fetch(`${API_URL}/dashboard`, { headers: { Authorization: `Bearer ${token}` } }),
                fetch(`${API_URL}/collections`, { headers: { Authorization: `Bearer ${token}` } })
            ]);

            if (!dashRes.ok) throw new Error("Failed to load dashboard items");
            const dashData = await dashRes.json();
            setTrackedProducts(dashData.tracked || []);

            if (colRes.ok) {
                const colData = await colRes.json();
                setCollections(colData.data || []);
            }
        } catch (err: unknown) {
            console.error("Dashboard Provider error:", err);
            if (err instanceof Error) {
                setError(err.message || "Failed to load dashboard data");
            } else {
                setError("An unexpected error occurred");
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        refreshDashboard();
    }, [refreshDashboard]);

    const moveProductToCollection = async (productId: number, collectionId: number | null) => {
        const token = getSessionToken();
        
        // Optimistic UI updates
        setTrackedProducts(prev => prev.map(p => 
            p.product.id === productId ? { ...p, product: { ...p.product, collectionId } } : p
        ));
        
        // Optimistically recount collections based on the new array
        setCollections(prevCols => prevCols.map(col => {
            const newCount = trackedProducts.filter(p => {
                // If it's the moving product, simulate its new destination
                if (p.product.id === productId) return collectionId === col.id;
                // Otherwise use existing location
                return p.product.collectionId === col.id;
            }).length;
            return { ...col, productCount: newCount };
        }));

        try {
            const res = await fetch(`${API_URL}/products/${productId}/move`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ collectionId })
            });

            if (!res.ok) throw new Error("Move API failed");
            
            // Sync up completely silently to make sure counts are perfectly 100% true with server
            refreshDashboard();
        } catch (err) {
            console.error("Failed to move item", err);
            // Revert on error by refetching
            refreshDashboard();
        }
    };

    const removeProductOptimistically = (subscriptionId: number) => {
        setTrackedProducts(prev => prev.filter(p => p.subscription_id !== subscriptionId));
        // Soft refresh to align counts silently
        refreshDashboard();
    };

    return (
        <DashboardContext.Provider value={{
            trackedProducts,
            collections,
            loading,
            error,
            refreshDashboard,
            moveProductToCollection,
            removeProductOptimistically
        }}>
            {children}
        </DashboardContext.Provider>
    );
}

export function useDashboard() {
    const context = useContext(DashboardContext);
    if (context === undefined) {
        throw new Error("useDashboard must be used within a DashboardProvider");
    }
    return context;
}
