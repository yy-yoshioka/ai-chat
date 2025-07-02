'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { format } from 'date-fns';

interface MetricsChartProps {
  title: string;
  metrics: {
    service: string;
    metricType: string;
    unit: string;
    data: Array<{
      timestamp: string;
      value: number;
    }>;
  };
  color?: string;
}

export function MetricsChart({ title, metrics, color = '#3b82f6' }: MetricsChartProps) {
  const formattedData = metrics.data.map((point) => ({
    ...point,
    time: format(new Date(point.timestamp), 'HH:mm'),
    fullTime: format(new Date(point.timestamp), 'PPp'),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={formattedData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" fontSize={12} interval="preserveStartEnd" />
            <YAxis
              fontSize={12}
              tickFormatter={(value) => `${value}${metrics.unit === 'percent' ? '%' : ''}`}
            />
            <Tooltip
              labelFormatter={(label, payload) => {
                if (payload && payload[0]) {
                  return payload[0].payload.fullTime;
                }
                return label;
              }}
              formatter={(value: number) => [`${value.toFixed(2)} ${metrics.unit}`, 'Value']}
            />
            <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
