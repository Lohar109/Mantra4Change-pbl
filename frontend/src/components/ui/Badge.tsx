import { getRiskBadgeClass } from '../../utils/risk.utils';

interface BadgeProps {
  label: string;
  variant?: 'risk' | 'default' | 'blue';
}

export function Badge({ label, variant = 'default' }: BadgeProps) {
  let cls = 'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium';
  if (variant === 'risk') {
    cls += ` ${getRiskBadgeClass(label)}`;
  } else if (variant === 'blue') {
    cls += ' bg-blue-100 text-blue-800';
  } else {
    cls += ' bg-gray-100 text-gray-700';
  }
  return <span className={cls}>{label}</span>;
}
