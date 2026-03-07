'use client'

import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts'
import { PriceHistoryItem } from '@/types'

interface Props {
  priceHistory: PriceHistoryItem[]
  currency: string
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function formatDateTime(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function CustomTooltip(props: any) {
  const { active, payload, label, currency } = props
  if (!active || !payload?.length) return null

  const currentPrice = payload[0].value
  const previousPrice = payload[0].payload.prevPrice

  let changeElement = null
  if (previousPrice) {
    const diff = currentPrice - previousPrice
    const pct = (Math.abs(diff) / previousPrice) * 100
    if (diff > 0) {
      changeElement = <span style={{ color: '#ef4444', marginLeft: '6px' }}>↑ {pct.toFixed(1)}%</span>
    } else if (diff < 0) {
      changeElement = <span style={{ color: '#22c55e', marginLeft: '6px' }}>↓ {pct.toFixed(1)}%</span>
    }
  }

  return (
    <div style={{
      background: '#fff',
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      padding: '8px 12px',
      boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
    }}>
      <p style={{ fontSize: '11px', color: '#6b7280', marginBottom: '2px' }}>
        {formatDateTime(label)}
      </p>
      <p style={{ fontSize: '14px', fontWeight: 700, color: '#111' }}>
        {currency} {currentPrice.toLocaleString()} {changeElement}
      </p>
    </div>
  )
}

export default function PriceChart({ priceHistory, currency }: Props) {
  if (!priceHistory || priceHistory.length < 2) {
    return (
      <div style={{
        marginTop: '1.5rem',
        padding: '3rem 1.5rem',
        textAlign: 'center',
        background: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e5e7eb',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.5rem'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '0.5rem' }}>📊</div>
        <h4 style={{ fontWeight: 700, fontSize: '16px', color: '#111827' }}>Building your price history</h4>
        <p style={{ color: '#6b7280', fontSize: '14px', maxWidth: '400px', lineHeight: 1.5 }}>
          We've just started tracking this product. Check back soon — price history builds automatically as we monitor this listing.
        </p>
        <div className="flex gap-1 mt-4">
          <div className="w-2 h-2 bg-gray-300 rounded-full animate-pulse" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-gray-300 rounded-full animate-pulse" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-gray-300 rounded-full animate-pulse" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    )
  }

  const chartData = priceHistory
    .map(item => ({ date: item.recordedAt, price: item.price }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((item, i, arr) => ({
      ...item,
      prevPrice: i > 0 ? arr[i - 1].price : null
    }))

  const prices = chartData.map(d => d.price)
  const minPrice = Math.max(0, Math.min(...prices))
  const maxPrice = Math.max(...prices) || 1
  const lowPrice = Math.min(...prices).toLocaleString()
  const highPrice = Math.max(...prices).toLocaleString()

  const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length
  const currentPrice = prices[prices.length - 1]
  const isGoodPrice = currentPrice <= avgPrice

  const strokeColor = isGoodPrice ? '#22c55e' : '#ef4444'
  const fillColor = isGoodPrice ? '#bbf7d0' : '#fee2e2'

  const yDomainMin = minPrice * 0.95
  const yDomainMax = maxPrice * 1.05

  return (
    <div style={{ marginTop: '1.5rem' }}>

      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem flex-wrap gap-4' }}>
        <div>
          <h4 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#111827' }}>
            Price History
          </h4>
          <p style={{ color: '#6b7280', fontSize: '13px', marginTop: '2px' }}>
            {priceHistory.length} price points recorded
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <div className="flex bg-gray-100 p-1 rounded-full mr-4 text-xs font-semibold text-gray-500">
            <button className="px-3 py-1 rounded-full">7D</button>
            <button className="px-3 py-1 rounded-full bg-[#2d5a27] text-white">30D</button>
            <button className="px-3 py-1 rounded-full">90D</button>
            <button className="px-3 py-1 rounded-full">All</button>
          </div>

          <span style={{
            padding: '4px 10px',
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: '16px',
            fontSize: '11px', fontWeight: 600,
            color: '#166534',
          }}>
            Low: {currency} {lowPrice}
          </span>
          <span style={{
            padding: '4px 10px',
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '16px',
            fontSize: '11px', fontWeight: 600,
            color: '#991b1b',
          }}>
            High: {currency} {highPrice}
          </span>
        </div>
      </div>

      {/* Chart container */}
      <div style={{
        background: '#ffffff',
        borderRadius: '16px',
        padding: '24px 16px 8px 0',
        border: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
      }}>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={fillColor} stopOpacity={0.8} />
                <stop offset="95%" stopColor={fillColor} stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#f3f4f6"
              vertical={false}
            />

            <XAxis
              dataKey="date"
              tickFormatter={formatDate}
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              axisLine={false}
              tickLine={false}
              dy={10}
            />

            <YAxis
              domain={[yDomainMin, yDomainMax]}
              tickFormatter={(val) => val >= 1000 ? `${(val / 1000).toFixed(1)}K` : val.toLocaleString()}
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              axisLine={false}
              tickLine={false}
              dx={-5}
              width={52}
            />

            <Tooltip
              content={(tooltipProps: any) => CustomTooltip({ ...tooltipProps, currency })}
              cursor={{ stroke: '#e5e7eb', strokeWidth: 1, strokeDasharray: '5 5' }}
            />

            <Area
              type="monotone"
              dataKey="price"
              stroke={strokeColor}
              strokeWidth={2.5}
              fill="url(#colorPrice)"
              animationDuration={800}
              animationEasing="ease-out"
              dot={false}
              activeDot={{ r: 6, fill: strokeColor, stroke: '#fff', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

    </div>
  )
}