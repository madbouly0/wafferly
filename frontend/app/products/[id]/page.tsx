'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { getProductById } from '@/lib/api'
import { Product } from '@/types'
import PriceInfoCard from '@/components/PriceInfoCard'
import Modal from '@/components/Modal'
import PriceChart from '@/components/PriceChart'

/* ─────────────────────────────────────────────
   Helper for removing Amazon boilerplate
───────────────────────────────────────────── */
function cleanDescription(text: string) {
  const boilerplateStarters = [
    "Found a lower price",
    "Fields with an asterisk",
    "This item has been tested to certify",
    "Customer Reviews, including",
    "To calculate the overall star rating"
  ]
  return text.split('\n').filter(line =>
    !boilerplateStarters.some(starter => line.trim().startsWith(starter))
  ).join('\n')
}

/* ─────────────────────────────────────────────
   Pincer animation variants
───────────────────────────────────────────── */
const pincerEase: [number, number, number, number] = [0.16, 1, 0.3, 1]

const leftPanel = {
  hidden: { x: -60, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.8, ease: pincerEase, delay: 0.15 },
  },
}

const rightPanel = {
  hidden: { x: 60, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.8, ease: pincerEase, delay: 0.15 },
  },
}

const fadeUp = (delay: number) => ({
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: pincerEase, delay },
  },
})

/* ─────────────────────────────────────────────
   Product detail page
───────────────────────────────────────────── */
const ProductDetails = () => {
  const params = useParams()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'description' | 'specs' | 'reviews'>('description')
  const [selectedImage, setSelectedImage] = useState<string>('')
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const id = Number(params.id)
        const response = await getProductById(id)
        setProduct(response.data)
        if (response.data?.image) setSelectedImage(response.data.image)
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
        <div className="product-skeleton-loader">
          <div className="skeleton" style={{ width: '100%', height: '400px', borderRadius: '16px' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
            <div className="skeleton" style={{ width: '60%', height: '24px' }} />
            <div className="skeleton" style={{ width: '90%', height: '36px' }} />
            <div className="skeleton" style={{ width: '40%', height: '28px' }} />
          </div>
        </div>
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
    <div className="product-layout-main max-w-7xl mx-auto w-full px-4 py-8">

      {/* TOP SECTION: Gallery + Info Card */}
      <div className="product-layout-top">

        {/* LEFT: Product Image Gallery */}
        <motion.div
          className="gallery-column"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="main-image-wrapper">
            <Image
              src={selectedImage || product.image}
              alt={product.title}
              width={500}
              height={500}
              className="object-contain"
            />
          </div>

          <div className="thumbnail-strip">
            {[product.image, ...Array(3).fill(product.image)].map((img, idx) => (
              <button
                key={idx}
                className={`thumbnail-btn ${selectedImage === img && idx === 0 ? 'active' : ''}`}
                onClick={() => setSelectedImage(img)}
              >
                <Image src={img} alt={`Thumb ${idx}`} width={60} height={60} />
              </button>
            ))}
          </div>

          <div className="verified-badge">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            Verified Amazon Listing
          </div>
        </motion.div>

        {/* RIGHT: Product Info Card */}
        <motion.div
          className="info-card-column"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {/* Top Actions */}
          <div className="flex justify-between items-start mb-2">
            <div>
              {product.category && (
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                  {product.category}
                </p>
              )}
              <h1 className="text-2xl font-bold text-gray-900 leading-tight">
                {product.title}
              </h1>
            </div>

            <div className="flex gap-2">
              <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                <Image src="/assets/icons/bookmark.svg" alt="bookmark" width={20} height={20} className="opacity-60" />
              </button>
              <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                <Image src="/assets/icons/share.svg" alt="share" width={20} height={20} className="opacity-60" />
              </button>
            </div>
          </div>

          {/* Price Block */}
          <div className="mt-4 mb-2 border-b border-gray-100 pb-6">
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-extrabold text-[#111]">
                {product.currency} {product.currentPrice.toLocaleString()}
              </span>
              <span className="text-lg text-gray-400 line-through">
                {product.currency} {product.originalPrice.toLocaleString()}
              </span>
            </div>

            {product.highestPrice && product.currentPrice < product.highestPrice ? (
              <div className="price-trend-badge down">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg>
                {Math.round(((product.highestPrice - product.currentPrice) / product.highestPrice) * 100)}% from highest
              </div>
            ) : product.currentPrice > product.averagePrice ? (
              <div className="price-trend-badge up">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg>
                Trending UP
              </div>
            ) : (
              <div className="price-trend-badge stable">
                Stable Price
              </div>
            )}

            <div className="flex items-center gap-4 mt-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Image src="/assets/icons/star.svg" alt="star" width={16} height={16} />
                <span className="font-bold text-gray-900">{product.stars}</span>
              </div>
              <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
              <span>{product.reviewsCount} Reviews</span>
              <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
              <span className="text-green-600 font-medium">93% recommend</span>
            </div>
          </div>

          {/* Stats Grid 2x2 */}
          <div className="stats-grid-2x2">
            <div className="stat-box" style={{ borderLeftColor: '#3B82F6', animationDelay: '0.1s' }}>
              <div className="flex items-center gap-2 text-gray-500 text-[11px] uppercase font-bold tracking-wider">
                <Image src="/assets/icons/price-tag.svg" alt="" width={12} height={12} className="opacity-50" />
                Current Price
              </div>
              <div className="text-base font-bold text-gray-900 text-lg">
                {product.currency} {product.currentPrice.toLocaleString()}
              </div>
            </div>
            <div className="stat-box" style={{ borderLeftColor: '#9CA3AF', animationDelay: '0.2s' }}>
              <div className="flex items-center gap-2 text-gray-500 text-[11px] uppercase font-bold tracking-wider">
                <Image src="/assets/icons/chart.svg" alt="" width={12} height={12} className="opacity-50" />
                Average Price
              </div>
              <div className="text-base font-bold text-gray-900 text-lg">
                {product.currency} {product.averagePrice.toLocaleString()}
              </div>
            </div>
            <div className="stat-box" style={{ borderLeftColor: '#EF4444', animationDelay: '0.3s' }}>
              <div className="flex items-center gap-2 text-gray-500 text-[11px] uppercase font-bold tracking-wider">
                <Image src="/assets/icons/arrow-up.svg" alt="" width={12} height={12} className="opacity-50" />
                Highest Price
              </div>
              <div className="text-base font-bold text-gray-900 text-lg">
                {product.currency} {product.highestPrice.toLocaleString()}
              </div>
            </div>
            <div className="stat-box" style={{ borderLeftColor: '#22C55E', animationDelay: '0.4s' }}>
              <div className="flex items-center gap-2 text-gray-500 text-[11px] uppercase font-bold tracking-wider">
                <Image src="/assets/icons/arrow-down.svg" alt="" width={12} height={12} className="opacity-50" />
                Lowest Price
              </div>
              <div className="text-base font-bold text-gray-900 text-lg">
                {product.currency} {product.lowestPrice.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Desktop/Sticky Actions */}
          <div className="mt-auto flex flex-col gap-3 mobile-sticky-actions">
            <a href={product.url} target="_blank" rel="noopener noreferrer"
              className="w-full h-12 rounded-[10px] bg-[#f9bf29] text-[#111] font-semibold flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform">
              <Image src="/assets/icons/bag.svg" alt="buy" width={18} height={18} className="brightness-0" />
              Buy Now
            </a>
            <button onClick={() => setIsModalOpen(true)}
              className="w-full h-12 rounded-[10px] bg-transparent border-2 border-[#f9bf29] text-[#111] font-semibold flex items-center justify-center gap-2 hover:bg-[#fff9ea] transition-colors">
              <Image src="/assets/icons/mail.svg" alt="track" width={18} height={18} style={{ filter: 'invert(10%) sepia(3%) saturate(14%) hue-rotate(314deg) brightness(96%) contrast(92%)' }} />
              Track Price
            </button>
            <button onClick={() => setIsModalOpen(true)} className="text-sm text-gray-500 text-center mt-2 hover:text-[#f9bf29] transition-colors">
              🔔 Set price alert — notify me when price drops below ___
            </button>
          </div>

        </motion.div>
      </div>

      {/* MIDDLE SECTION: Price History Chart */}
      <motion.div
        className="w-full mt-8"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <PriceChart priceHistory={product.priceHistory} currency={product.currency} />
      </motion.div>

      {/* BOTTOM SECTION: Tabs */}
      <motion.div
        className="mt-8 bg-white border border-gray-200 rounded-2xl p-6 lg:p-10"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <div className="tabs-header">
          <button className={`tab-btn ${activeTab === 'description' ? 'active' : ''}`} onClick={() => setActiveTab('description')}>Description</button>
          <button className={`tab-btn ${activeTab === 'specs' ? 'active' : ''}`} onClick={() => setActiveTab('specs')}>Specifications</button>
          <button className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`} onClick={() => setActiveTab('reviews')}>Reviews</button>
        </div>

        <div className="tab-content" style={{ minHeight: '300px' }}>
          {activeTab === 'description' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex flex-col gap-4 text-gray-700 leading-[1.8] max-w-[80ch]">
                {product.description ? (() => {
                  const cleaned = cleanDescription(product.description).split('\n').filter(p => p.trim() !== '');
                  const toShow = isExpanded ? cleaned : cleaned.slice(0, 1);
                  return (
                    <>
                      {toShow.map((p, i) => <p key={i}>{p}</p>)}
                      {cleaned.length > 1 && (
                        <button
                          onClick={() => setIsExpanded(!isExpanded)}
                          className="text-[#2d5a27] font-semibold text-left mt-2 hover:underline"
                        >
                          {isExpanded ? 'Read less' : 'Read more'}
                        </button>
                      )}
                    </>
                  );
                })() : <p className="text-gray-500 italic">No description available for this product.</p>}
              </div>
            </motion.div>
          )}

          {activeTab === 'specs' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-[800px]">
              <table className="spec-table">
                <tbody>
                  <tr><td className="spec-label">Brand</td><td className="spec-value">{product.category || 'N/A'}</td></tr>
                  <tr><td className="spec-label">Model Name</td><td className="spec-value">{product.title.split(' ').slice(0, 4).join(' ')}</td></tr>
                  <tr><td className="spec-label">Current Release</td><td className="spec-value">Standard edition</td></tr>
                  <tr><td className="spec-label">Warranty</td><td className="spec-value">Manufacturer standard</td></tr>
                  <tr><td className="spec-label">Retailer</td><td className="spec-value">Amazon Global</td></tr>
                </tbody>
              </table>
            </motion.div>
          )}

          {activeTab === 'reviews' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-8 flex-wrap">
              <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-2xl min-w-[200px]">
                <span className="text-5xl font-extrabold text-[#111]">{product.stars}</span>
                <Image src="/assets/icons/star.svg" alt="star" width={24} height={24} className="mt-2 mb-4" />
                <span className="text-sm font-medium text-gray-500">{product.reviewsCount} verified reviews</span>
                <span className="text-sm font-bold text-green-600 mt-1">93% of buyers recommended</span>
              </div>
              <div className="flex-1 flex flex-col gap-3 justify-center min-w-[300px]">
                {[5, 4, 3, 2, 1].map(num => (
                  <div key={num} className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-500 w-3">{num}</span>
                    <Image src="/assets/icons/star.svg" alt="star" width={12} height={12} className="opacity-50" />
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#f9bf29]" style={{ width: num === 5 ? '72%' : num === 4 ? '18%' : num === 3 ? '6%' : '2%' }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>

      <Modal productId={product.id} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

    </div>
  )
}

export default ProductDetails