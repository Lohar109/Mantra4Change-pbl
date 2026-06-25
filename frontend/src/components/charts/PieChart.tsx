import {
  PieChart as RechartsPie,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { RISK_COLORS } from '../../constants';

interface PieChartProps {
  data: { name: string; value: number }[];
  title: string;
  height?: number;
}

export function PieChart({ data, title, height = 260 }: PieChartProps) {
  const filtered = data.filter(d => d.value > 0);

  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-700 mb-3">{title}</h3>
      <ResponsiveContainer width="100%" height={height}>
        <RechartsPie>
          <Pie
            data={filtered}
            cx="50%"
            cy="45%"
            innerRadius={55}
            outerRadius={90}
            paddingAngle={2}
            dataKey="value"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            labelLine={false}
          >
            {filtered.map((entry, idx) => (
              <Cell key={idx} fill={RISK_COLORS[entry.name] ?? '#6b7280'} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number, name: string) => [value, name]}
            contentStyle={{ fontSize: 12, borderRadius: 8 }}
          />
          <Legend
            formatter={(value) => <span style={{ fontSize: 12, color: '#374151' }}>{value}</span>}
          />
        </RechartsPie>
      </ResponsiveContainer>
    </div>
  );
}
