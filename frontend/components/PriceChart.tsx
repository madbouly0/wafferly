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
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

function formatDateTime(dateStr: string) {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function CustomTooltip(props: any) {
  const { active, payload, label, currency } = props
  if (!active || !payload || !payload.length) return null

  return (
    <div style={{
      backgroundColor: '#fff',
      border: '1px solid #E4E4E4',
      borderRadius: '8px',
      padding: '8px 12px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    }}>
      <p style={{ fontSize: '11px', color: '#667085', marginBottom: '2px' }}>
        {formatDateTime(label)}
      </p>
      <p style={{ fontSize: '14px', fontWeight: 700, color: '#282828' }}>
        {currency} {payload[0].value.toFixed(2)}
      </p>
    </div>
  )
}

export default function PriceChart({ priceHistory, currency }: Props) {
  if (!priceHistory || priceHistory.length === 0) {
    return (
      <div style={{
        padding: '20px',
        textAlign: 'center',
        backgroundColor: '#F4F4F4',
        borderRadius: '10px',
        marginTop: '16px',
      }}>
        <p style={{ color: '#667085', fontSize: '14px' }}>
          No price history data available yet.
        </p>
      </div>
    )
  }

  const chartData = priceHistory
    .map(function (item) {
      return {
        date: item.recordedAt,
        price: item.price,
      }
    })
    .sort(function (a, b) {
      return new Date(a.date).getTime() - new Date(b.date).getTime()
    })

  if (chartData.length === 1) {
    const singlePoint = chartData[0]
    const yesterday = new Date(singlePoint.date)
    yesterday.setDate(yesterday.getDate() - 1)
    chartData.unshift({
      date: yesterday.toISOString(),
      price: singlePoint.price,
    })
  }

  const prices = chartData.map(function (d) { return d.price })
  const minPrice = Math.max(0, Math.min.apply(null, prices) * 0.9)
  const maxPrice = Math.max.apply(null, prices) * 1.1 || 1
  const lowPrice = Math.min.apply(null, prices).toFixed(2)
  const highPrice = Math.max.apply(null, prices).toFixed(2)

  return (
    <div style={{ marginTop: '16px' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '10px',
      }}>
        <div>
          <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#282828' }}>
            Price History
          </h4>
          <p style={{ color: '#667085', fontSize: '12px', marginTop: '2px' }}>
            {priceHistory.length} price points recorded
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <span style={{
            padding: '4px 10px',
            backgroundColor: '#ECFDF3',
            borderRadius: '16px',
            fontSize: '11px',
            fontWeight: 600,
            color: '#3E9242',
          }}>
            Low: {currency} {lowPrice}
          </span>
          <span style={{
            padding: '4px 10px',
            backgroundColor: '#FEF3F2',
            borderRadius: '16px',
            fontSize: '11px',
            fontWeight: 600,
            color: '#E43030',
          }}>
            High: {currency} {highPrice}
          </span>
        </div>
      </div>

      <div style={{
        backgroundColor: '#FAFAFA',
        borderRadius: '12px',
        padding: '16px 8px 8px 0',
        border: '1px solid #EAECF0',
      }}>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#E43030" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#E43030" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#EAECF0"
              vertical={false}
            />

            <XAxis
              dataKey="date"
              tickFormatter={formatDate}
              tick={{ fontSize: 11, fill: '#667085' }}
              axisLine={{ stroke: '#EAECF0' }}
              tickLine={false}
              dy={5}
            />

            <YAxis
              domain={[minPrice, maxPrice]}
              tick={{ fontSize: 11, fill: '#667085' }}
              axisLine={false}
              tickLine={false}
              dx={-5}
              width={50}
            />

            <Tooltip
              content={function (tooltipProps: any) {
                return CustomTooltip({ ...tooltipProps, currency: currency })
              }}
              cursor={{ stroke: '#E43030', strokeWidth: 1, strokeDasharray: '5 5' }}
            />

            <Area
              type="monotone"
              dataKey="price"
              stroke="#E43030"
              strokeWidth={2}
              fill="url(#priceGradient)"
              dot={{ r: 4, fill: '#E43030', stroke: '#fff', strokeWidth: 2 }}
              activeDot={{ r: 6, fill: '#E43030', stroke: '#fff', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}