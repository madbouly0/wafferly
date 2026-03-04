'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { getProductById } from '@/lib/api'
import { Product } from '@/types'
import PriceInfoCard from '@/components/PriceInfoCard'
import Modal from '@/components/Modal'
import PriceChart from '@/components/PriceChart'

const ProductDetails = () => {
  const params = useParams()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const id = Number(params.id)
        const response = await getProductById(id)
        setProduct(response.data)
      } catch (error) {
        console.error('Failed to fetch product:', error)
      } finally {
        setLoading(false)
      }
    }
    if (params.id) fetchProduct()
  }, [params.id])

  if (loading) {
    return (
      <div className="product-container">
        <p className="text-xl">Loading product details...</p>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="product-container">
        <p className="text-xl" style={{ color: 'var(--color-dark)' }}>Product not found</p>
        <Link href="/" className="text-primary underline">Go back home</Link>
      </div>
    )
  }

  return (
    <div className="product-container">

      {/* TWO-COLUMN LAYOUT */}
      <div className="flex gap-10 xl:flex-row flex-col">

        {/* LEFT — Product image */}
        <div className="product-image">
          <Image
            src={product.image}
            alt={product.title}
            width={580}
            height={400}
            className="mx-auto object-contain"
          />
        </div>

        {/* RIGHT — Green info panel (title lives here, no separate hero banner) */}
        <div className="product-info-col">

          {/* Title + action icons row */}
          <div className="flex justify-between items-start gap-4 flex-wrap" style={{ marginBottom: '1.25rem' }}>
            <div style={{ flex: 1 }}>
              {product.category && (
                <p style={{
                  fontSize: '0.7rem', fontWeight: 700,
                  letterSpacing: '0.07em', textTransform: 'uppercase',
                  color: 'var(--color-secondary)', marginBottom: '0.35rem'
                }}>
                  {product.category}
                </p>
              )}
              <h1 style={{
                fontSize: 'clamp(1.25rem, 2.5vw, 1.75rem)',
                fontWeight: 700, color: '#ffffff', lineHeight: 1.25
              }}>
                {product.title}
              </h1>
            </div>

            <div className="flex items-center gap-2" style={{ flexShrink: 0 }}>
              <div className="product-hearts">
                <Image src="/assets/icons/red-heart.svg" alt="heart" width={18} height={18} />
                <p className="text-sm font-semibold">{product.reviewsCount}</p>
              </div>
              <div className="p-2 rounded-10 cursor-pointer" style={{ background: 'rgba(255,255,255,0.12)' }}>
                <Image src="/assets/icons/bookmark.svg" alt="bookmark" width={18} height={18}
                  style={{ filter: 'brightness(0) invert(1)' }} />
              </div>
              <div className="p-2 rounded-10 cursor-pointer" style={{ background: 'rgba(255,255,255,0.12)' }}>
                <Image src="/assets/icons/share.svg" alt="share" width={18} height={18}
                  style={{ filter: 'brightness(0) invert(1)' }} />
              </div>
            </div>
          </div>

          {/* Price & ratings */}
          <div className="product-info">
            <div className="flex flex-col gap-1">
              <p style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-secondary)' }}>
                {product.currency} {product.currentPrice}
              </p>
              <p style={{ fontSize: '1rem', textDecoration: 'line-through', color: 'rgba(255,255,255,0.4)' }}>
                {product.currency} {product.originalPrice}
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex gap-2">
                <div className="product-stars">
                  <Image src="/assets/icons/star.svg" alt="star" width={14} height={14} />
                  <p className="text-sm font-semibold" style={{ color: 'var(--color-secondary)' }}>
                    {product.stars}
                  </p>
                </div>
                <div className="product-reviews">
                  <Image src="/assets/icons/comment.svg" alt="comment" width={14} height={14}
                    style={{ filter: 'brightness(0) invert(1)' }} />
                  <p className="text-sm font-semibold" style={{ color: '#fff' }}>
                    {product.reviewsCount} Reviews
                  </p>
                </div>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>
                <span style={{ color: '#6ee77a', fontWeight: 700 }}>93% </span>
                of buyers recommended this product
              </p>
            </div>
          </div>

          {/* Price info cards */}
          <div style={{ margin: '1.5rem 0', display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
            <PriceInfoCard
              title="Current Price"
              iconSrc="/assets/icons/price-tag.svg"
              value={`${product.currency} ${product.currentPrice}`}
              borderColor="#b6dbff"
            />
            <PriceInfoCard
              title="Average Price"
              iconSrc="/assets/icons/chart.svg"
              value={`${product.currency} ${product.averagePrice}`}
              borderColor="#8B5CF6"
            />
            <PriceInfoCard
              title="Highest Price"
              iconSrc="/assets/icons/arrow-up.svg"
              value={`${product.currency} ${product.highestPrice}`}
              borderColor="#E43030"
            />
            <PriceInfoCard
              title="Lowest Price"
              iconSrc="/assets/icons/arrow-down.svg"
              value={`${product.currency} ${product.lowestPrice}`}
              borderColor="#3E9242"
            />
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-3">
            <a
              href={product.url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn flex items-center justify-center gap-3"
              style={{ minWidth: '200px', width: 'fit-content' }}
            >
              <Image src="/assets/icons/bag.svg" alt="buy" width={20} height={20}
                style={{ filter: 'brightness(0) invert(1)' }} />
              <span className="text-base text-white">Buy Now</span>
            </a>
            <button
              className="btn flex items-center justify-center gap-3"
              style={{ backgroundColor: '#E43030', minWidth: '200px', width: 'fit-content' }}
              onClick={() => setIsModalOpen(true)}
            >
              <Image src="/assets/icons/mail.svg" alt="mail" width={20} height={20}
                style={{ filter: 'brightness(0) invert(1)' }} />
              <span className="text-base text-white">Track Price</span>
            </button>
          </div>

          {/* Price chart */}
          <PriceChart priceHistory={product.priceHistory} currency={product.currency} />

        </div>
      </div>

      {/* DESCRIPTION */}
      <div className="flex flex-col gap-5">
        <h3 className="text-2xl font-semibold" style={{ color: 'var(--color-dark)' }}>
          Product Description
        </h3>
        <div className="flex flex-col gap-4">
          {product.description ? (
            product.description.split('\n').map((line, index) => (
              <p key={index} className="text-base text-gray-600 leading-7">{line}</p>
            ))
          ) : (
            <p className="text-base text-gray-500">No description available for this product.</p>
          )}
        </div>
      </div>

      <Modal productId={product.id} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

    </div>
  )
}

export default ProductDetails