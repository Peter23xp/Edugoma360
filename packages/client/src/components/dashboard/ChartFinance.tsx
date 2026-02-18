import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import { Card, CardHeader, CardContent } from '../ui/card';
import { Wallet } from 'lucide-react';

export interface FinanceMonth {
  label: string;
  expected: number;
  collected: number;
}

interface ChartFinanceProps {
  data: FinanceMonth[];
  isLoading?: boolean;
}

export default function ChartFinance({ data, isLoading }: ChartFinanceProps) {
  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}K`;
    }
    return value.toString();
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percentage = ((data.collected / data.expected) * 100).toFixed(0);
      return (
        <div className="bg-white p-3 border border-neutral-200 rounded-lg shadow-lg">
          <p className="font-semibold text-neutral-900 mb-2">{data.label}</p>
          <div className="space-y-1 text-sm">
            <p className="text-neutral-600">
              Attendu : <span className="font-bold">{formatCurrency(data.expected)} FC</span>
            </p>
            <p className="text-green-600">
              Collecté : <span className="font-bold">{formatCurrency(data.collected)} FC</span>
            </p>
            <p className="text-neutral-500 text-xs">({percentage}%)</p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Wallet size={20} className="text-neutral-600" />
          <h3 className="text-lg font-semibold text-neutral-900">Recouvrement financier</h3>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="animate-pulse space-y-3">
            <div className="h-64 bg-gray-200 rounded" />
          </div>
        ) : data.length === 0 ? (
          <div className="text-center py-12">
            <Wallet size={32} className="mx-auto text-neutral-300 mb-2" />
            <p className="text-sm text-neutral-600">Aucune donnée disponible</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCollected" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#16a34a" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="label" />
              <YAxis tickFormatter={formatCurrency} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="expected"
                stroke="#9ca3af"
                strokeDasharray="5 5"
                fill="none"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="collected"
                stroke="#16a34a"
                fill="url(#colorCollected)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
