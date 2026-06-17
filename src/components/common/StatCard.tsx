import { TrendingUp, TrendingDown, type LucideIcon } from 'lucide-react';
import { cn, formatNumber, formatPercent } from '../../utils/helpers';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  suffix?: string;
  trend?: number;
  color?: 'cyber' | 'bio' | 'warn' | 'danger';
  decimals?: number;
  asPercent?: boolean;
  description?: string;
}

const COLOR_MAP: Record<string, string> = {
  cyber: 'from-cyber-500/20 to-cyber-500/0 text-cyber-400 border-cyber-500/30',
  bio: 'from-bio-500/20 to-bio-500/0 text-bio-400 border-bio-500/30',
  warn: 'from-warn-500/20 to-warn-500/0 text-warn-400 border-warn-500/30',
  danger: 'from-danger-500/20 to-danger-500/0 text-danger-400 border-danger-500/30',
};

const ICON_BG_MAP: Record<string, string> = {
  cyber: 'bg-cyber-500/10 text-cyber-400',
  bio: 'bg-bio-500/10 text-bio-400',
  warn: 'bg-warn-500/10 text-warn-400',
  danger: 'bg-danger-500/10 text-danger-400',
};

export function StatCard({
  title,
  value,
  icon: Icon,
  suffix,
  trend,
  color = 'cyber',
  decimals = 1,
  asPercent = false,
  description,
}: StatCardProps) {
  const displayValue =
    typeof value === 'number' ? (asPercent ? formatPercent(value, decimals) : formatNumber(value, decimals)) : value;

  return (
    <div
      className={cn(
        'relative glass-card p-5 overflow-hidden group transition-all duration-300 hover:shadow-glow-cyber hover:-translate-y-0.5'
      )}
    >
      <div className={cn('absolute inset-0 bg-gradient-to-br opacity-40 pointer-events-none', COLOR_MAP[color])} />

      <div className="relative">
        <div className="flex items-start justify-between mb-3">
          <p className="text-xs font-medium text-space-400 uppercase tracking-wider">{title}</p>
          <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center', ICON_BG_MAP[color])}>
            <Icon className="w-4.5 h-4.5" />
          </div>
        </div>

        <div className="flex items-end gap-2 mb-2">
          <span className="text-2xl font-bold font-mono tracking-tight text-white">
            {displayValue}
            {suffix && <span className="text-base text-space-400 ml-1">{suffix}</span>}
          </span>
          {trend !== undefined && (
            <div className="flex items-center gap-0.5 mb-1">
              {trend >= 0 ? (
                <TrendingUp className="w-3.5 h-3.5 text-bio-400" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5 text-danger-400" />
              )}
              <span className={cn('text-xs font-mono font-medium', trend >= 0 ? 'text-bio-400' : 'text-danger-400')}>
                {trend >= 0 ? '+' : ''}
                {formatPercent(trend, 1)}
              </span>
            </div>
          )}
        </div>

        {description && <p className="text-[11px] text-space-500">{description}</p>}
      </div>
    </div>
  );
}
