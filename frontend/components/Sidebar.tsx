"use client";

import { useState } from "react";
import Link from "next/link";
import { getUserEmail, getSessionToken } from "@/lib/auth";
import { useDroppable } from "@dnd-kit/core";
import { API_URL } from "@/lib/api";
import { useDashboard } from "@/contexts/DashboardContext";

// Helper component to make a collection link a drop target
function DroppableNavItem({ id, href, isActive, name, count, isAllItems = false }: { id: string, href: string, isActive: boolean, name: string, count?: number, isAllItems?: boolean }) {
    const { isOver, setNodeRef } = useDroppable({ id });

    return (
        <Link href={href}
            ref={setNodeRef}
            style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0.6rem 0.75rem', borderRadius: 'var(--radius-10)',
                textDecoration: 'none', transition: '0.2s',
                background: isOver
                    ? 'rgba(59,93,80,0.1)' // highlight on hover drag
                    : isActive ? 'var(--color-lighter)' : 'transparent',
                color: isActive ? 'var(--color-primary)' : 'var(--color-dark)',
                fontWeight: isActive ? 600 : 500,
                border: isOver ? '1px dashed var(--color-primary)' : '1px solid transparent'
            }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {isAllItems ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
                )}
                <span style={{ fontSize: isAllItems ? '0.95rem' : '0.9rem' }}>{name}</span>
            </div>
            {count !== undefined && (
                <span style={{ fontSize: '0.7rem', color: isActive ? 'var(--color-primary)' : 'var(--color-body)', background: isActive ? 'white' : 'var(--color-lighter)', padding: '2px 6px', borderRadius: '10px' }}>
                    {count}
                </span>
            )}
        </Link>
    );
}

export default function Sidebar({ currentPath }: { currentPath: string }) {
    const userEmail = getUserEmail();
    const { collections, loading, refreshDashboard } = useDashboard();
    
    const [isCreating, setIsCreating] = useState(false);
    const [newColName, setNewColName] = useState("");

    const handleCreateCollection = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newColName.trim()) return;

        try {
            const token = getSessionToken();
            const res = await fetch(`${API_URL}/collections`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ name: newColName })
            });

            if (res.ok) {
                setNewColName("");
                setIsCreating(false);
                await refreshDashboard(); // Refresh list via context
            }
        } catch (err) {
            console.error("Failed to create collection", err);
        }
    };

    const isAllItems = currentPath === "/dashboard" || currentPath === "/dashboard/page.tsx" || currentPath === "/dashboard/layout.tsx";

    return (
        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', height: '100%', fontFamily: 'var(--font-inter)' }}>

            {/* User Profile Summary */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
                <div style={{
                    width: '40px', height: '40px', borderRadius: '50%', background: 'var(--color-primary)',
                    color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, fontSize: '1.2rem', fontFamily: 'var(--font-spaceGrotesk)'
                }}>
                    {userEmail?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div style={{ overflow: 'hidden' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-dark)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                        {userEmail?.split('@')[0]}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--color-body)' }}>Wafferly User</div>
                </div>
            </div>

            {/* Main Nav */}
            <div style={{ marginBottom: '2rem' }}>
                <DroppableNavItem
                    id="collection-all-items"
                    href="/dashboard"
                    isActive={currentPath === "/dashboard"}
                    name="All Items"
                    isAllItems={true}
                />
            </div>

            {/* Collections Section */}
            <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-body)', marginBottom: '0.75rem', paddingLeft: '0.75rem' }}>
                    Your Collections
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    {loading ? (
                        <div style={{ padding: '0.75rem', fontSize: '0.85rem', color: 'var(--color-body)' }}>Loading...</div>
                    ) : collections.length === 0 ? (
                        <div style={{ padding: '1rem 0.75rem', fontSize: '0.85rem', color: 'var(--color-body)', textAlign: 'center' }}>
                            No collections yet. Organize your tracked items!
                        </div>
                    ) : (
                        collections.map(col => {
                            const isColActive = currentPath === `/dashboard/collections/${col.id}`;
                            return (
                                <DroppableNavItem
                                    key={col.id}
                                    id={`collection-${col.id}`}
                                    href={`/dashboard/collections/${col.id}`}
                                    isActive={isColActive}
                                    name={col.name}
                                    count={col.productCount}
                                />
                            );
                        })
                    )}
                </div>

                {isCreating ? (
                    <form onSubmit={handleCreateCollection} style={{ marginTop: '1rem', padding: '0.75rem', background: 'var(--color-lighter)', borderRadius: 'var(--radius-10)' }}>
                        <input
                            autoFocus
                            type="text"
                            placeholder="Collection name..."
                            value={newColName}
                            onChange={(e) => setNewColName(e.target.value)}
                            style={{
                                width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--color-light)',
                                fontSize: '0.85rem', marginBottom: '0.5rem', outline: 'none'
                            }}
                        />
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button type="submit" style={{ flex: 1, padding: '4px', background: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: '6px', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 600 }}>Save</button>
                            <button type="button" onClick={() => { setIsCreating(false); setNewColName(''); }} style={{ flex: 1, padding: '4px', background: 'transparent', color: 'var(--color-body)', border: '1px solid var(--color-light)', borderRadius: '6px', fontSize: '0.75rem', cursor: 'pointer' }}>Cancel</button>
                        </div>
                    </form>
                ) : (
                    <button
                        onClick={() => setIsCreating(true)}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '8px', marginTop: '1rem', padding: '0.6rem 0.75rem',
                            width: '100%', background: 'transparent', border: '1px dashed var(--color-light)',
                            borderRadius: 'var(--radius-10)', color: 'var(--color-body)', cursor: 'pointer',
                            fontSize: '0.85rem', fontWeight: 500, transition: '0.2s'
                        }}
                        onMouseOver={(e) => { e.currentTarget.style.borderColor = 'var(--color-primary)'; e.currentTarget.style.color = 'var(--color-primary)'; }}
                        onMouseOut={(e) => { e.currentTarget.style.borderColor = 'var(--color-light)'; e.currentTarget.style.color = 'var(--color-body)'; }}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                        New Collection
                    </button>
                )}
            </div>
        </div>
    );
}
