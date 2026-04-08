import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CategoryDistribution } from '@/types/patrimony';

interface PatrimonyDistributionBarsProps {
  distribution: CategoryDistribution[];
}

export const PatrimonyDistributionBars: React.FC<PatrimonyDistributionBarsProps> = ({
  distribution,
}) => {
  if (distribution.length === 0) {
    return (
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-white text-base flex items-center gap-2">
            <span className="text-lg">📈</span>
            Distribución por Tipo
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-32">
          <p className="text-zinc-500 text-sm">Sin activos registrados</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader className="pb-2">
        <CardTitle className="text-white text-base flex items-center gap-2">
          <span className="text-lg">📈</span>
          Distribución por Tipo
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {distribution.map((item) => (
          <div key={item.category} className="space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm font-medium text-zinc-300">
                  {item.label}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-zinc-500">
                  {item.value.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                </span>
                <span className="text-sm font-bold text-white w-12 text-right">
                  {item.percentage.toFixed(0)}%
                </span>
              </div>
            </div>
            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${item.percentage}%`,
                  backgroundColor: item.color,
                }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
