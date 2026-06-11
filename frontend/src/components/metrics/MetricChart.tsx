'use client';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

interface MetricChartProps {
  title: string;
  data: any[];
  dataKey: string;
  color: string;
  unit: string;
}

export function MetricChart({ title, data, dataKey, color, unit }: MetricChartProps) {
  const chartData = data.map(d => ({
    ...d,
    time: format(new Date(d.timestamp), 'HH:mm'),
    value: parseFloat(d[dataKey]?.toFixed(1) ?? 0),
  }));

  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <h3 className="text-sm font-semibold text-foreground mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={160}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id={`grad-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e3a5f" />
          <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#64748b' }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fontSize: 10, fill: '#64748b' }} tickLine={false} axisLine={false}
            tickFormatter={(v) => `${v}${unit}`} domain={[0, 'auto']} />
          <Tooltip
            contentStyle={{ background: '#0f1f35', border: '1px solid #1e3a5f', borderRadius: '8px', fontSize: 12 }}
            labelStyle={{ color: '#94a3b8' }}
            formatter={(v: any) => [`${v}${unit}`, title]}
          />
          <Area type="monotone" dataKey="value" stroke={color} strokeWidth={2}
            fill={`url(#grad-${dataKey})`} dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
