import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend
} from 'recharts';

interface ChartData {
  name: string;
  value: number;
}

interface ConversionData {
  date: string;
  clicks: number;
  purchases: number;
  revenue: number;
}

const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444'];

interface AnalyticsChartsProps {
  conversionsByOffer?: any[];
  conversionsByRule?: any[];
  conversionsByPeriod?: ConversionData[];
}

export function ConversionsByOfferChart({ conversionsByOffer }: { conversionsByOffer: any[] }) {
  const data = conversionsByOffer?.map(item => ({
    name: item.offer_title || 'Unknown',
    value: item.total_conversions || 0
  })) || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Conversiones por Oferta</CardTitle>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function ConversionsByCategoryChart({ conversionsByOffer }: { conversionsByOffer: any[] }) {
  const categoryData: Record<string, number> = {};
  
  conversionsByOffer?.forEach(item => {
    const category = item.category || 'other';
    categoryData[category] = (categoryData[category] || 0) + (item.total_conversions || 0);
  });

  const data = Object.entries(categoryData).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Conversiones por Categoría</CardTitle>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function RevenueOverTimeChart({ conversionsByPeriod }: { conversionsByPeriod: ConversionData[] }) {
  const data = conversionsByPeriod || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Ingresos en el Tiempo</CardTitle>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="revenue" 
              stroke="#10b981" 
              strokeWidth={2}
              name="Ingresos (€)"
            />
            <Line 
              type="monotone" 
              dataKey="clicks" 
              stroke="#3b82f6" 
              strokeWidth={2}
              name="Clics"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function ConversionRateChart({ conversionsByOffer }: { conversionsByOffer: any[] }) {
  const data = conversionsByOffer?.map(item => ({
    name: item.offer_title || 'Unknown',
    clicks: item.total_clicks || 0,
    purchases: item.total_purchases || 0
  })) || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Tasa de Conversión</CardTitle>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            <Bar dataKey="clicks" fill="#3b82f6" name="Clics" radius={[4, 4, 0, 0]} />
            <Bar dataKey="purchases" fill="#10b981" name="Compras" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}