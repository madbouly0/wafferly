import Image from 'next/image'

interface Props {
  title: string
  iconSrc: string
  value: string
  borderColor: string
}

const PriceInfoCard = ({ title, iconSrc, value, borderColor }: Props) => (
  <div
    className="price-info_card"
    style={{ borderLeftColor: borderColor }}
  >
    {/* Label row */}
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
      <Image
        src={iconSrc}
        alt=""
        aria-hidden="true"
        width={16}
        height={16}
        style={{ filter: 'brightness(0) invert(1)', opacity: 0.7 }}
      />
      <span className="price-label">{title}</span>
    </div>

    {/* Value */}
    <p className="price-value">{value}</p>
  </div>
)

export default PriceInfoCard