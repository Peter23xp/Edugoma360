import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const COLOR_MAP = {
  primary: { icon: 'text-[#1B5E20]', iconBg: 'bg-[#1B5E20]/10' },
  accent:  { icon: 'text-[#F57F17]', iconBg: 'bg-[#F57F17]/10' },
  info:    { icon: 'text-[#0D47A1]', iconBg: 'bg-[#0D47A1]/10' },
  error:   { icon: 'text-[#C62828]', iconBg: 'bg-[#C62828]/10' },
  neutral: { icon: 'text-gray-500',  iconBg: 'bg-gray-100' },
};

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: { value: number; direction: 'up' | 'down' | 'neutral'; label: string };
  color?: keyof typeof COLOR_MAP;
  onClick?: () => void;
}

export function KPICard({ title, value, subtitle, icon: Icon, trend, color = 'primary', onClick }: KPICardProps) {
  const cfg = COLOR_MAP[color];

  return (
    <div
      className={`bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-all duration-200 ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-gray-500 truncate">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1 leading-tight">{value}</p>
          {subtitle && <p className="text-xs text-gray-400 mt-0.5 truncate">{subtitle}</p>}
          {trend && (
            <div className={`flex items-center gap-1 mt-1.5 text-xs font-medium ${
              trend.direction === 'up' ? 'text-green-600' : trend.direction === 'down' ? 'text-red-500' : 'text-gray-400'
            }`}>
              {trend.direction === 'up' && <TrendingUp className="h-3 w-3" />}
              {trend.direction === 'down' && <TrendingDown className="h-3 w-3" />}
              {trend.direction === 'neutral' && <Minus className="h-3 w-3" />}
              <span>{trend.value > 0 ? '+' : ''}{trend.value} {trend.label}</span>
            </div>
          )}
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.iconBg}`}>
          <Icon className={`h-5 w-5 ${cfg.icon}`} />
        </div>
      </div>
    </div>
  );
}
