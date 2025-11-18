'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Card } from '@/components/ui/card'

interface EloDataPoint {
  recorded_at: string
  elo_after: number
}

interface EloChartProps {
  data: EloDataPoint[]
}

export function EloChart({ data }: EloChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card className="p-8">
        <p className="text-center text-muted-foreground">No ELO history yet. Play some games to see your progression!</p>
      </Card>
    )
  }

  // Transform data for the chart
  const chartData = data.map((point) => ({
    date: new Date(point.recorded_at).toLocaleDateString(),
    elo: point.elo_after,
  }))

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">ELO Progression</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            dataKey="date"
            className="text-xs"
            tick={{ fontSize: 12 }}
          />
          <YAxis
            domain={['dataMin - 50', 'dataMax + 50']}
            className="text-xs"
            tick={{ fontSize: 12 }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '6px'
            }}
          />
          <Line
            type="monotone"
            dataKey="elo"
            stroke="#990000"
            strokeWidth={2}
            dot={{ fill: '#990000', r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  )
}
