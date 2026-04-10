"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { isLoggedIn } from "@/lib/auth";
import Sidebar from "@/components/Sidebar";
import { DndContext, DragEndEvent, MouseSensor, TouchSensor, useSensor, useSensors } from "@dnd-kit/core";
import { DashboardProvider, useDashboard } from "@/contexts/DashboardContext";

function DashboardLayoutInner({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [mounted, setMounted] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    
    // Consume the context
    const { moveProductToCollection } = useDashboard();

    useEffect(() => {
        setMounted(true);
        if (!isLoggedIn()) {
            router.push("/auth/login");
        }
    }, [router]);

    const sensors = useSensors(
        useSensor(MouseSensor, {
            activationConstraint: { distance: 5 },
        }),
        useSensor(TouchSensor, {
            activationConstraint: { delay: 250, tolerance: 5 },
        })
    );

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over) return;

        const productIdStr = String(active.id).replace('product-', '');
        let collectionIdStr = String(over.id).replace('collection-', '');
        if (collectionIdStr === 'all-items') collectionIdStr = 'null';

        const parsedProductId = parseInt(productIdStr);
        const parsedCollectionId = collectionIdStr === 'null' ? null : parseInt(collectionIdStr);

        if (!isNaN(parsedProductId)) {
            await moveProductToCollection(parsedProductId, parsedCollectionId);
        }
    };

    if (!mounted) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#eff2f1] relative overflow-hidden text-[#3b5d50]">
                <div className="w-12 h-12 rounded-full border-4 border-black/5 border-t-[#3b5d50] animate-spin mb-4"></div>
                <div className="text-black/40 font-inter text-sm font-medium tracking-wide">Assembling dashboard...</div>
            </div>
        );
    }

    if (!isLoggedIn()) return null;

    return (
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
            <div className="flex min-h-[calc(100vh-80px)] relative w-full font-inter">
                {/* Mobile Menu Overlay */}
                {isMobileMenuOpen && (
                    <div
                        className="fixed inset-0 bg-black/40 z-40 md:hidden backdrop-blur-sm transition-opacity"
                        role="button"
                        tabIndex={0}
                        onClick={() => setIsMobileMenuOpen(false)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                setIsMobileMenuOpen(false);
                            }
                        }}
                        aria-label="Close Mobile Menu"
                    />
                )}

                {/* Sidebar Column */}
                <aside className={`
                    fixed md:sticky top-[80px] h-[calc(100vh-80px)] z-50
                    w-[280px] shrink-0 border-r border-[#dce5e4] bg-white
                    overflow-y-auto transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
                    ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                `}>
                    <Sidebar currentPath={pathname} />
                </aside>

                {/* Main Content Column */}
                <div className="flex-1 min-w-0 w-full flex flex-col">
                    {/* Mobile Hamburger Header */}
                    <div className="md:hidden p-4 border-b border-[#dce5e4] bg-white/80 backdrop-blur-md sticky top-[80px] z-30 flex items-center justify-between shadow-sm">
                        <span className="font-semibold text-sm text-[#3b5d50] uppercase tracking-wider">Dashboard</span>
                        <button
                            className="p-1.5 border border-[#dce5e4] rounded-md text-[#2f2f2f] hover:bg-gray-50 active:scale-95 transition-all"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            aria-label="Toggle Menu"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                <line x1="3" y1="12" x2="21" y2="12"></line>
                                <line x1="3" y1="6" x2="21" y2="6"></line>
                                <line x1="3" y1="18" x2="21" y2="18"></line>
                            </svg>
                        </button>
                    </div>

                    <div className="flex-1 w-full relative">
                        {children}
                    </div>
                </div>
            </div>
        </DndContext>
    );
}

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <DashboardProvider>
            <DashboardLayoutInner>
                {children}
            </DashboardLayoutInner>
        </DashboardProvider>
    );
}
