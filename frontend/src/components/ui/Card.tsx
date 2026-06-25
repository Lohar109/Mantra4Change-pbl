import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export function Card({ children, className = '', onClick }: CardProps) {
  return (
    <div
      className={`bg-white rounded-xl border border-gray-200 shadow-sm ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

interface KPICardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  trend?: ReactNode;
  highlight?: 'green' | 'yellow' | 'orange' | 'red' | 'blue';
}

const highlightMap = {
  green: 'border-l-4 border-l-green-500',
  yellow: 'border-l-4 border-l-yellow-500',
  orange: 'border-l-4 border-l-orange-500',
  red: 'border-l-4 border-l-red-500',
  blue: 'border-l-4 border-l-blue-500',
};

export function KPICard({ label, value, subtitle, trend, highlight }: KPICardProps) {
  return (
    <Card className={`p-4 ${highlight ? highlightMap[highlight] : ''}`}>
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
      <div className="mt-1 flex items-end gap-2">
        <span className="text-2xl font-bold text-gray-900">{value}</span>
        {trend && <span className="mb-0.5">{trend}</span>}
      </div>
      {subtitle && <p className="mt-1 text-xs text-gray-400">{subtitle}</p>}
    </Card>
  );
}
