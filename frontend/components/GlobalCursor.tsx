'use client'

import dynamic from 'next/dynamic'

const BlobCursor = dynamic(() => import('@/components/reactbits/BlobCursor'), { ssr: false })

export default function GlobalCursor() {
    return <BlobCursor fillColor="#f9bf29" opacity={0.15} size={300} />
}
