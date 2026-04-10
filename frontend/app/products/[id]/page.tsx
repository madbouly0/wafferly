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
      <div className="product-container max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-1/2 h-[400px] bg-lighter rounded-2xl"></div>
          <div className="w-full md:w-1/2 flex flex-col gap-4">
            <div className="w-[60%] h-6 bg-lighter rounded"></div>
            <div className="w-[90%] h-10 bg-lighter rounded"></div>
            <div className="w-[40%] h-8 bg-lighter rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="product-container max-w-7xl mx-auto px-4 py-8 text-center">
        <p className="text-xl text-dark font-spaceGrotesk font-bold">Product not found</p>
        <Link href="/" className="text-primary mt-4 inline-block underline underline-offset-4">Go back home</Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto w-full px-4 py-12">
      {/* TOP SECTION: Gallery + Info Card */}
      <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">

        {/* LEFT: Product Image Gallery */}
        <motion.div
          className="flex-1"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-full bg-white rounded-3xl p-8 border border-light flex items-center justify-center min-h-[400px] lg:min-h-[500px]">
            <Image
              src={selectedImage || product.image}
              alt={product.title}
              width={500}
              height={500}
              className="object-contain w-full h-full max-h-[400px]"
            />
          </div>

          <div className="flex gap-4 mt-6">
            {[product.image, ...Array(3).fill(product.image)].map((img, idx) => (
              <button
                key={idx}
                className={`w-20 h-20 rounded-xl border p-2 bg-white transition-all ${selectedImage === img && idx === 0 ? 'border-primary ring-1 ring-primary' : 'border-light hover:border-body cursor-pointer'}`}
                onClick={() => setSelectedImage(img)}
              >
                <Image src={img} alt={`Thumb ${idx}`} width={64} height={64} className="w-full h-full object-contain" />
              </button>
            ))}
          </div>

          <div className="mt-6 flex items-center gap-2 text-primary font-medium text-sm">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            Verified Amazon Listing
          </div>
        </motion.div>

        {/* RIGHT: Product Info Card */}
        <motion.div
          className="flex-1 flex flex-col"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {/* Top Actions */}
          <div className="flex justify-between items-start mb-4">
            <div>
              {product.category && (
                <p className="text-[10px] font-bold text-body uppercase tracking-[0.1em] mb-2">
                  {product.category}
                </p>
              )}
              <h1 className="font-spaceGrotesk text-[2rem] font-bold text-dark leading-[1.15] tracking-tight">
                {product.title}
              </h1>
            </div>

            <div className="flex gap-2">
              <button className="p-2 rounded-full hover:bg-lighter transition-colors text-body">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
              </button>
              <button className="p-2 rounded-full hover:bg-lighter transition-colors text-body">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
              </button>
            </div>
          </div>

          {/* Price Block */}
          <div className="mt-2 pb-6">
            <div className="flex items-baseline gap-3">
              <span className="font-spaceGrotesk text-4xl lg:text-[3.25rem] font-bold text-dark tracking-tight">
                {product.currency} {product.currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              {product.originalPrice > product.currentPrice && (
                <span className="font-inter text-xl text-body/70 line-through">
                  {product.currency} {product.originalPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              )}
            </div>

            <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold tracking-wide" style={{ background: 'rgba(59,93,80,0.08)', color: 'var(--color-primary)' }}>
              {(product.highestPrice || product.currentPrice) > product.currentPrice ? (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg>
                  {Math.round((((product.highestPrice || product.currentPrice) - product.currentPrice) / (product.highestPrice || product.currentPrice)) * 100)}% drop from highest
                </>
              ) : product.currentPrice > (product.averagePrice || product.currentPrice) ? (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg>
                  Trending UP
                </>
              ) : (
                <>Stable Price</>
              )}
            </div>

            <div className="flex items-center gap-4 mt-6 text-sm text-body font-medium">
              {product.stars && (
                <div className="flex items-center gap-1.5 text-dark">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="var(--color-secondary)" stroke="var(--color-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                  <span>{product.stars}</span>
                </div>
              )}
              {product.stars && product.reviewsCount && <div className="w-1 h-1 bg-light rounded-full"></div>}
              {product.reviewsCount && <span>{product.reviewsCount.toLocaleString()} Reviews</span>}
              {product.reviewsCount && <div className="w-1 h-1 bg-light rounded-full"></div>}
              <span className="text-primary font-semibold">Highly recommended</span>
            </div>
          </div>

          {/* Minimalist Stats Grid */}
          <div className="grid grid-cols-2 gap-y-6 gap-x-8 mt-4 pt-6 lg:mt-8 lg:pt-8 border-t border-light">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-body uppercase tracking-[0.1em] mb-1">Current Price</span>
              <span className="font-spaceGrotesk text-xl font-bold text-dark">
                {product.currency} {product.currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-body uppercase tracking-[0.1em] mb-1">Average Price</span>
              <span className="font-spaceGrotesk text-xl font-bold text-dark">
                {product.currency} {(product.averagePrice || product.currentPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-body uppercase tracking-[0.1em] mb-1">Highest Price</span>
              <span className="font-spaceGrotesk text-xl font-bold text-dark">
                {product.currency} {(product.highestPrice || product.currentPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-body uppercase tracking-[0.1em] mb-1">Lowest Price</span>
              <span className="font-spaceGrotesk text-xl font-bold text-primary">
                {product.currency} {(product.lowestPrice || product.currentPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Desktop/Sticky Actions */}
          <div className="mt-10 lg:mt-auto flex flex-col gap-3">
            <a href={product.url} target="_blank" rel="noopener noreferrer"
              className="btn btn-secondary w-full !text-[1rem] !py-3">
              <span className="flex items-center gap-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8V6a6 6 0 0 0-12 0v2"></path><rect x="4" y="8" width="16" height="13" rx="2" ry="2"></rect></svg>
                View on Amazon
              </span>
            </a>
            <button onClick={() => setIsModalOpen(true)}
              className="btn btn-white-outline w-full !text-[1rem] !py-3 !text-primary border-primary hover:!bg-primary hover:!text-white border-2">
              <span className="flex items-center gap-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 17H2a3 3 0 0 0 3-3V9a7 7 0 0 1 14 0v5a3 3 0 0 0 3 3zm-8.27 4a2 2 0 0 1-3.46 0"></path></svg>
                Watch Price
              </span>
            </button>
            <button onClick={() => setIsModalOpen(true)} className="text-[13px] text-body text-center mt-3 hover:text-primary transition-colors inline-block w-full">
              Set a target price & get notified immediately.
            </button>
          </div>

        </motion.div>
      </div>

      {/* MIDDLE SECTION: Price History Chart */}
      <motion.div
        className="w-full mt-16 pt-8 border-t border-light"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="mb-8">
          <h2 className="font-spaceGrotesk text-2xl font-bold text-dark">Price History</h2>
          <p className="text-body mt-1 max-w-[500px]">Historical price drops and fluctuations for this item on Amazon.</p>
        </div>
        <PriceChart priceHistory={product.priceHistory} currency={product.currency} />
      </motion.div>

      {/* BOTTOM SECTION: Tabs */}
      <motion.div
        className="mt-16 pt-10 border-t border-light"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <div className="flex gap-8 border-b border-light mb-10 overflow-x-auto hide-scrollbar">
          <button className={`pb-3 text-sm font-semibold tracking-wide transition-colors whitespace-nowrap ${activeTab === 'description' ? 'border-b-2 border-primary text-primary' : 'text-body hover:text-dark'}`} onClick={() => setActiveTab('description')}>Description</button>
          <button className={`pb-3 text-sm font-semibold tracking-wide transition-colors whitespace-nowrap ${activeTab === 'specs' ? 'border-b-2 border-primary text-primary' : 'text-body hover:text-dark'}`} onClick={() => setActiveTab('specs')}>Specifications</button>
          <button className={`pb-3 text-sm font-semibold tracking-wide transition-colors whitespace-nowrap ${activeTab === 'reviews' ? 'border-b-2 border-primary text-primary' : 'text-body hover:text-dark'}`} onClick={() => setActiveTab('reviews')}>Reviews</button>
        </div>

        <div className="min-h-[200px]">
          {activeTab === 'description' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex flex-col gap-5 text-dark leading-[1.8] max-w-[70ch] text-[15px]">
                {product.description ? (() => {
                  const cleaned = cleanDescription(product.description).split('\n').filter(p => p.trim() !== '');
                  const toShow = isExpanded ? cleaned : cleaned.slice(0, 2);
                  return (
                    <>
                      {toShow.map((p, i) => <p key={i}>{p}</p>)}
                      {cleaned.length > 2 && (
                        <button
                          onClick={() => setIsExpanded(!isExpanded)}
                          className="text-primary font-bold text-left mt-2 hover:underline self-start uppercase text-[12px] tracking-wider"
                        >
                          {isExpanded ? 'Show less' : 'Read full description'}
                        </button>
                      )}
                    </>
                  );
                })() : <p className="text-body italic">No description available for this product.</p>}
              </div>
            </motion.div>
          )}

          {activeTab === 'specs' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-[70ch]">
              <div className="grid grid-cols-[1fr_2fr] gap-y-4 gap-x-8 text-[15px]">
                <div className="font-bold text-dark">Brand</div>
                <div className="text-body">{product.category || 'N/A'}</div>
                <div className="w-full h-[1px] bg-light col-span-2"></div>

                <div className="font-bold text-dark">Model Name</div>
                <div className="text-body">{product.title.split(' ').slice(0, 4).join(' ')}</div>
                <div className="w-full h-[1px] bg-light col-span-2"></div>

                <div className="font-bold text-dark">Current Release</div>
                <div className="text-body">Standard edition</div>
                <div className="w-full h-[1px] bg-light col-span-2"></div>

                <div className="font-bold text-dark">Retailer</div>
                <div className="text-body">Amazon Global</div>
              </div>
            </motion.div>
          )}

          {activeTab === 'reviews' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col sm:flex-row gap-12 flex-wrap items-center sm:items-start max-w-[800px]">
              <div className="flex flex-col items-center justify-center p-8 bg-white border border-light rounded-3xl min-w-[200px] shadow-sm">
                <span className="text-6xl font-spaceGrotesk tracking-tight font-bold text-dark leading-none">{product.stars}</span>
                <div className="flex mt-4 mb-2">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="var(--color-secondary)" stroke="var(--color-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                </div>
                <span className="text-sm font-medium text-body">{product.reviewsCount} verified ratings</span>
              </div>

              <div className="flex-1 flex flex-col gap-4 min-w-[300px] w-full mt-2">
                {[5, 4, 3, 2, 1].map(num => (
                  <div key={num} className="flex items-center gap-4">
                    <span className="text-sm font-bold text-dark w-3">{num}</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-body/30" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                    <div className="flex-1 h-1.5 bg-light rounded-full overflow-hidden">
                      <div className="h-full bg-secondary" style={{ width: num === 5 ? '72%' : num === 4 ? '18%' : num === 3 ? '6%' : '2%' }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>

      <Modal productId={product.id} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

    </div >
  )
}

export default ProductDetails