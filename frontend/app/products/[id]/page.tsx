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

    if (params.id) {
      fetchProduct()
    }
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
        <p className="text-xl text-red-500">Product not found</p>
        <Link href="/" className="text-primary underline">
          Go back home
        </Link>
      </div>
    )
  }

  return (
    <div className="product-container">
      {/* TOP SECTION */}
      <div className="flex gap-16 xl:flex-row flex-col">
        {/* PRODUCT IMAGE */}
        <div className="product-image">
          <Image
            src={product.image}
            alt={product.title}
            width={580}
            height={400}
            className="mx-auto object-contain"
          />
        </div>

        {/* PRODUCT INFO — Right Column */}
        <div className="flex-1 flex flex-col">
          <div className="flex justify-between items-start gap-5 flex-wrap pb-6">
            <div>
              <p className="text-sm text-gray-500 opacity-70">
                {product.category}
              </p>
              <h1 className="text-2xl font-semibold text-secondary">
                {product.title}
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <div className="product-hearts">
                <Image
                  src="/assets/icons/red-heart.svg"
                  alt="heart"
                  width={20}
                  height={20}
                />
                <p className="text-sm font-semibold text-primary">
                  {product.reviewsCount}
                </p>
              </div>

              <div className="p-2 bg-white-200 rounded-10 cursor-pointer">
                <Image
                  src="/assets/icons/bookmark.svg"
                  alt="bookmark"
                  width={20}
                  height={20}
                />
              </div>

              <div className="p-2 bg-white-200 rounded-10 cursor-pointer">
                <Image
                  src="/assets/icons/share.svg"
                  alt="share"
                  width={20}
                  height={20}
                />
              </div>
            </div>
          </div>

          {/* PRICE & INFO */}
          <div className="product-info">
            <div className="flex flex-col gap-2">
              <p className="text-3xl font-bold text-secondary">
                {product.currency} {product.currentPrice}
              </p>
              <p className="text-xl text-black line-through opacity-50">
                {product.currency} {product.originalPrice}
              </p>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex gap-3">
                <div className="product-stars">
                  <Image
                    src="/assets/icons/star.svg"
                    alt="star"
                    width={16}
                    height={16}
                  />
                  <p className="text-sm font-semibold text-primary-orange">
                    {product.stars}
                  </p>
                </div>

                <div className="product-reviews">
                  <Image
                    src="/assets/icons/comment.svg"
                    alt="comment"
                    width={16}
                    height={16}
                  />
                  <p className="text-sm font-semibold text-secondary">
                    {product.reviewsCount} Reviews
                  </p>
                </div>
              </div>

              <p className="text-sm text-black opacity-50">
                <span className="text-primary-green font-bold">93% </span>
                of buyers recommended this product
              </p>
            </div>
          </div>

          {/* PRICE INFO CARDS */}
          <div className="my-7 flex flex-col gap-5">
            <div className="flex gap-5 flex-wrap">
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
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex flex-col gap-3">
            <a
              href={product.url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn flex items-center justify-center gap-3 min-w-[200px] w-fit"
            >
              <Image
                src="/assets/icons/bag.svg"
                alt="buy"
                width={22}
                height={22}
                style={{ filter: 'brightness(0) invert(1)' }}
              />
              <span className="text-base text-white">Buy Now</span>
            </a>

            <button
              className="btn flex items-center justify-center gap-3 min-w-[200px] w-fit"
              style={{ backgroundColor: '#E43030' }}
              onClick={() => setIsModalOpen(true)}
            >
              <Image
                src="/assets/icons/mail.svg"
                alt="mail"
                width={22}
                height={22}
                style={{ filter: 'brightness(0) invert(1)' }}
              />
              <span className="text-base text-white">Track Price</span>
            </button>
          </div>

          {/* PRICE CHART — Inside Right Column, Below Buttons */}
          <PriceChart
            priceHistory={product.priceHistory}
            currency={product.currency}
          />
        </div>
      </div>

      {/* DESCRIPTION */}
      <div className="flex flex-col gap-5">
        <h3 className="text-2xl font-semibold text-secondary">
          Product Description
        </h3>

        <div className="flex flex-col gap-4">
          {product.description ? (
            product.description.split('\n').map((line, index) => (
              <p key={index} className="text-base text-gray-600 leading-7">
                {line}
              </p>
            ))
          ) : (
            <p className="text-base text-gray-500">
              No description available for this product.
            </p>
          )}
        </div>
      </div>

      {/* MODAL */}
      <Modal
        productId={product.id}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  )
}

export default ProductDetails