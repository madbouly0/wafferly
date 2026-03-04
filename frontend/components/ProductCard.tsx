import Link from 'next/link'
import Image from 'next/image'
import { Product } from '@/types'

interface Props {
  product: Product
}

const ProductCard = ({ product }: Props) => {
  const hasDiscount =
    product.originalPrice &&
    product.currentPrice &&
    product.originalPrice > product.currentPrice

  const discountPct = hasDiscount
    ? Math.round(((product.originalPrice - product.currentPrice) / product.originalPrice) * 100)
    : null

  return (
    <Link href={`/products/${product.id}`} className="product-card" aria-label={product.title}>

      {/* Image — floats freely, lifts on hover */}
      <div className="product-card_img-container">
        <Image
          src={product.image}
          alt={product.title}
          width={200}
          height={200}
          className="product-card_img"
        />

        {/* Discount badge — top-right corner */}
        {discountPct && (
          <span
            aria-label={`${discountPct}% off`}
            style={{
              position: 'absolute',
              top: '0.5rem',
              right: '0.5rem',
              background: 'var(--color-secondary)',
              color: 'var(--color-dark)',
              fontSize: '0.7rem',
              fontWeight: 700,
              padding: '2px 7px',
              borderRadius: '20px',
              zIndex: 2,
            }}
          >
            -{discountPct}%
          </span>
        )}
      </div>

      {/* Text */}
      <div className="product-card-body">
        <h3 className="product-title">{product.title}</h3>

        <p className="product-price">
          {product.currency}&nbsp;{product.currentPrice}
          {hasDiscount && (
            <span className="product-price-original">
              {product.currency}&nbsp;{product.originalPrice}
            </span>
          )}
        </p>
      </div>

      {/* Dark + circle — Furni icon-cross pattern, slides in on hover */}
      <button
        className="product-card-cta"
        aria-label={`Track price for ${product.title}`}
        tabIndex={-1}           /* link itself is focusable */
        onClick={e => e.preventDefault()}  /* parent <Link> handles navigation */
      >
        <svg viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
          aria-hidden="true">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5"  y1="12" x2="19" y2="12"/>
        </svg>
      </button>

    </Link>
  )
}

export default ProductCard