"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { isLoggedIn, getSessionToken } from "@/lib/auth";
import Sidebar from "@/components/Sidebar";
import { DndContext, DragEndEvent, MouseSensor, TouchSensor, useSensor, useSensors } from "@dnd-kit/core";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (!isLoggedIn()) {
            router.push("/auth/login");
        }
    }, [router]);

    const sensors = useSensors(
        useSensor(MouseSensor, {
            // Require mouse movement of 5 pixels before drag starts so clicks still work
            activationConstraint: { distance: 5 },
        }),
        useSensor(TouchSensor, {
            // Require press of 250ms for touch drag to prevent scrolling issues
            activationConstraint: { delay: 250, tolerance: 5 },
        })
    );

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        // active.id is the product id, over.id is the collection id (or null if dropped on "All Items")
        if (!over) return;

        const productId = String(active.id).replace('product-', '');
        let collectionId = String(over.id).replace('collection-', '');
        if (collectionId === 'all-items') collectionId = 'null';

        try {
            const token = getSessionToken();
            await fetch(`http://localhost:5000/api/products/${productId}/move`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ collectionId: collectionId === 'null' ? null : parseInt(collectionId) })
            });
            // Fire event so Sidebar and Page can refetch their specific data
            window.dispatchEvent(new Event("dashboard:changed"));
        } catch (err) {
            console.error("Failed to move item", err);
        }
    };

    if (!mounted) return null; // Avoid hydration mismatch

    if (!isLoggedIn()) return null;

    return (
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
            <div style={{ display: 'flex', minHeight: 'calc(100vh - 80px)' }}>
                {/* Sidebar Column */}
                <aside style={{
                    width: '280px',
                    flexShrink: 0,
                    borderRight: '1px solid var(--color-light)',
                    background: 'var(--color-white)',
                    position: 'sticky',
                    top: '80px', // Below navbar
                    height: 'calc(100vh - 80px)',
                    overflowY: 'auto'
                }}>
                    <Sidebar currentPath={pathname} />
                </aside>

                {/* Main Content Column */}
                <div style={{ flex: 1, minWidth: 0 }}>
                    {children}
                </div>
            </div>
        </DndContext>
    );
}
