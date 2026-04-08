import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CategoryDistribution } from '@/types/patrimony';

interface PatrimonyDistributionChartProps {
  distribution: CategoryDistribution[];
  totalAssets: number;
}

export const PatrimonyDistributionChart: React.FC<PatrimonyDistributionChartProps> = ({
  distribution,
  totalAssets,
}) => {
  const size = 180;
  const strokeWidth = 24;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  let accumulatedPercentage = 0;

  const segments = distribution.map((item, index) => {
    const percentage = item.percentage;
    const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;
    const strokeDashoffset = -((accumulatedPercentage / 100) * circumference);
    accumulatedPercentage += percentage;

    return {
      ...item,
      strokeDasharray,
      strokeDashoffset,
      index,
    };
  });

  if (distribution.length === 0) {
    return (
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-white text-base flex items-center gap-2">
            <span className="text-lg">📊</span>
            Distribución
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-48">
          <p className="text-zinc-500 text-sm">Sin datos disponibles</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader className="pb-2">
        <CardTitle className="text-white text-base flex items-center gap-2">
          <span className="text-lg">📊</span>
          Distribución
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center">
          <div className="relative">
            <svg width={size} height={size} className="transform -rotate-90">
              <circle
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke="rgba(255,255,255,0.05)"
                strokeWidth={strokeWidth}
              />
              {segments.map((segment, i) => (
                <circle
                  key={i}
                  cx={center}
                  cy={center}
                  r={radius}
                  fill="none"
                  stroke={segment.color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={segment.strokeDasharray}
                  strokeDashoffset={segment.strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-500"
                />
              ))}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-white">
                {distribution.length}
              </span>
              <span className="text-xs text-zinc-400">categorías</span>
            </div>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          {distribution.slice(0, 4).map((item) => (
            <div key={item.category} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm text-zinc-300 flex-1 truncate">
                {item.label}
              </span>
              <span className="text-sm font-medium text-white">
                {item.percentage.toFixed(0)}%
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
