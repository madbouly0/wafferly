"use client";

import { useEffect } from "react";
import Link from "next/link";
export default function DashboardError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("Dashboard Error:", error);
    }, [error]);

    return (
        <div className="min-h-screen bg-[#eff2f1] flex flex-col items-center justify-center p-6 text-center">
            <div className="bg-white p-10 rounded-[2rem] shadow-xl border border-[#dce5e4] max-w-lg w-full relative overflow-hidden">
                {/* Decorative Top Accent */}
                <div className="absolute top-0 left-0 w-full h-2 bg-red-500"></div>

                <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                </div>

                <h2 className="font-[Space_Grotesk] text-3xl font-bold text-[#2f2f2f] mb-4 tracking-tight">
                    Something went wrong
                </h2>

                <p className="text-[#6a6a6a] mb-8 leading-relaxed font-medium">
                    We encountered an unexpected error while putting together your dashboard. Our systems might be experiencing a hiccup.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                        onClick={() => reset()}
                        className="px-6 py-3 bg-[#3b5d50] text-white rounded-xl font-bold hover:bg-[#2d4a40] transition-colors shadow-sm active:scale-95 flex-1 sm:flex-none"
                    >
                        Try again
                    </button>
                    <Link
                        href="/"
                        className="px-6 py-3 bg-white text-[#3b5d50] border-2 border-[#dce5e4] rounded-xl font-bold hover:bg-[#eff2f1] hover:border-[#3b5d50]/20 transition-colors flex-1 sm:flex-none"
                    >
                        Go home
                    </Link>
                </div>
            </div>
        </div>
    );
}
