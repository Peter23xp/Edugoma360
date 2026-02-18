import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Card, CardHeader, CardContent } from '../ui/card';
import { TrendingUp } from 'lucide-react';

export interface ClassAverage {
  classId: string;
  className: string;
  average: number;
  studentCount: number;
}

interface ChartAveragesProps {
  data: ClassAverage[];
  isLoading?: boolean;
}

export default function ChartAverages({ data, isLoading }: ChartAveragesProps) {
  const getBarColor = (average: number) => {
    if (average >= 12) return '#16a34a'; // green-600
    if (average >= 10) return '#f59e0b'; // amber-500
    return '#dc2626'; // red-600
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-neutral-200 rounded-lg shadow-lg">
          <p className="font-semibold text-neutral-900">{data.className}</p>
          <p className="text-sm text-neutral-600">
            Moyenne : <span className="font-bold">{data.average.toFixed(1)}/20</span>
          </p>
          <p className="text-xs text-neutral-500">{data.studentCount} élèves</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <TrendingUp size={20} className="text-neutral-600" />
          <h3 className="text-lg font-semibold text-neutral-900">Moyennes par classe</h3>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="animate-pulse space-y-3">
            <div className="h-64 bg-gray-200 rounded" />
          </div>
        ) : data.length === 0 ? (
          <div className="text-center py-12">
            <TrendingUp size={32} className="mx-auto text-neutral-300 mb-2" />
            <p className="text-sm text-neutral-600">Aucune donnée disponible</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis type="number" domain={[0, 20]} />
              <YAxis dataKey="className" type="category" width={80} />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine x={10} stroke="#dc2626" strokeDasharray="3 3" label="Seuil" />
              <Bar
                dataKey="average"
                fill="#16a34a"
                radius={[0, 4, 4, 0]}
                shape={(props: any) => {
                  const { x, y, width, height, payload } = props;
                  return (
                    <rect
                      x={x}
                      y={y}
                      width={width}
                      height={height}
                      fill={getBarColor(payload.average)}
                      rx={4}
                    />
                  );
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
