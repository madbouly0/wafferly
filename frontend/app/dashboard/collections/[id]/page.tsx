import DashboardPage from "../page";

// Next.js App Router allows us to reuse the same client component for specific dynamic paths.
// We will modify the "page.tsx" DashboardPage to check `params.id` to filter by collection.
// But for now, we'll just export the same default component that will read the path or we can pass a prop.
export default function CollectionSpecificPage() {
    return <DashboardPage />;
}
