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
  return (
    <div style={{
      background: 'rgba(30, 58, 47, 0.95)',
      border: '1px solid rgba(255,255,255,0.15)',
      borderRadius: '8px',
      padding: '8px 12px',
      boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
    }}>
      <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginBottom: '2px' }}>
        {formatDateTime(label)}
      </p>
      <p style={{ fontSize: '14px', fontWeight: 700, color: '#f9bf29' }}>
        {currency} {payload[0].value.toFixed(2)}
      </p>
    </div>
  )
}

export default function PriceChart({ priceHistory, currency }: Props) {
  if (!priceHistory || priceHistory.length === 0) {
    return (
      <div style={{
        marginTop: '1.25rem',
        padding: '1.25rem',
        textAlign: 'center',
        background: 'rgba(255,255,255,0.08)',
        borderRadius: '12px',
        border: '1px solid rgba(255,255,255,0.1)',
      }}>
        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '14px' }}>
          No price history data available yet.
        </p>
      </div>
    )
  }

  const chartData = priceHistory
    .map(item => ({ date: item.recordedAt, price: item.price }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  // Duplicate single point so the chart renders a line
  if (chartData.length === 1) {
    const yesterday = new Date(chartData[0].date)
    yesterday.setDate(yesterday.getDate() - 1)
    chartData.unshift({ date: yesterday.toISOString(), price: chartData[0].price })
  }

  const prices = chartData.map(d => d.price)
  const minPrice = Math.max(0, Math.min(...prices) * 0.9)
  const maxPrice = Math.max(...prices) * 1.1 || 1
  const lowPrice  = Math.min(...prices).toFixed(2)
  const highPrice = Math.max(...prices).toFixed(2)

  return (
    <div style={{ marginTop: '1.5rem' }}>

      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
        <div>
          <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff' }}>
            Price History
          </h4>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '12px', marginTop: '2px' }}>
            {priceHistory.length} price points recorded
          </p>
        </div>

        {/* Low / High badges — styled for green background */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <span style={{
            padding: '4px 10px',
            background: 'rgba(110,231,122,0.15)',
            border: '1px solid rgba(110,231,122,0.3)',
            borderRadius: '16px',
            fontSize: '11px', fontWeight: 600,
            color: '#6ee77a',
          }}>
            Low: {currency} {lowPrice}
          </span>
          <span style={{
            padding: '4px 10px',
            background: 'rgba(228,48,48,0.15)',
            border: '1px solid rgba(228,48,48,0.3)',
            borderRadius: '16px',
            fontSize: '11px', fontWeight: 600,
            color: '#ff7a7a',
          }}>
            High: {currency} {highPrice}
          </span>
        </div>
      </div>

      {/* Chart container — dark-tinted panel that sits on the green */}
      <div style={{
        background: 'rgba(255,255,255,0.08)',
        borderRadius: '14px',
        padding: '16px 8px 8px 0',
        border: '1px solid rgba(255,255,255,0.1)',
      }}>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#f9bf29" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#f9bf29" stopOpacity={0}   />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.08)"
              vertical={false}
            />

            <XAxis
              dataKey="date"
              tickFormatter={formatDate}
              tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.4)' }}
              axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
              tickLine={false}
              dy={5}
            />

            <YAxis
              domain={[minPrice, maxPrice]}
              tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.4)' }}
              axisLine={false}
              tickLine={false}
              dx={-5}
              width={52}
            />

            <Tooltip
              content={(tooltipProps: any) =>
                CustomTooltip({ ...tooltipProps, currency })
              }
              cursor={{ stroke: 'rgba(249,191,41,0.4)', strokeWidth: 1, strokeDasharray: '5 5' }}
            />

            {/* Gold line — pops against the green panel */}
            <Area
              type="monotone"
              dataKey="price"
              stroke="#f9bf29"
              strokeWidth={2.5}
              fill="url(#priceGradient)"
              dot={{ r: 4, fill: '#f9bf29', stroke: 'rgba(59,93,80,0.8)', strokeWidth: 2 }}
              activeDot={{ r: 6, fill: '#f9bf29', stroke: '#fff', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

    </div>
  )
}