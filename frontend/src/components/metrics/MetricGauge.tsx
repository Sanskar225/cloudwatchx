'use client';
import { cn } from '@/lib/utils';

interface MetricGaugeProps {
  label: string;
  value?: number | null;
  unit: string;
  warningThreshold: number;
  criticalThreshold: number;
  maxValue?: number;
}

export function MetricGauge({ label, value, unit, warningThreshold, criticalThreshold, maxValue = 100 }: MetricGaugeProps) {
  const pct = value != null ? Math.min((value / maxValue) * 100, 100) : 0;
  const color = value == null ? 'bg-muted' :
    value >= criticalThreshold ? 'bg-red-500' :
    value >= warningThreshold ? 'bg-yellow-500' : 'bg-emerald-500';
  const textColor = value == null ? 'text-muted-foreground' :
    value >= criticalThreshold ? 'text-red-400' :
    value >= warningThreshold ? 'text-yellow-400' : 'text-emerald-400';

  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <p className="text-xs text-muted-foreground mb-2">{label}</p>
      <p className={cn('text-2xl font-bold mb-3', textColor)}>
        {value != null ? `${value.toFixed(1)}${unit}` : '—'}
      </p>
      <div className="w-full bg-accent rounded-full h-2">
        <div
          className={cn('h-2 rounded-full transition-all duration-500', color)}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-xs text-muted-foreground">0{unit}</span>
        <span className="text-xs text-muted-foreground">{maxValue}{unit}</span>
      </div>
    </div>
  );
}
