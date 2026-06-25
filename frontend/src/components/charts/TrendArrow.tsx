interface TrendArrowProps {
  change: number | null;
  suffix?: string;
}

export function TrendArrow({ change, suffix = 'pp' }: TrendArrowProps) {
  if (change === null) return null;

  const abs = Math.abs(change * 100).toFixed(1);

  if (change > 0.001) {
    return (
      <span className="inline-flex items-center gap-0.5 text-xs font-medium text-green-600">
        <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none">
          <path d="M6 2L10 7H2L6 2Z" fill="currentColor" />
        </svg>
        +{abs}{suffix}
      </span>
    );
  }

  if (change < -0.001) {
    return (
      <span className="inline-flex items-center gap-0.5 text-xs font-medium text-red-600">
        <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none">
          <path d="M6 10L2 5H10L6 10Z" fill="currentColor" />
        </svg>
        {abs}{suffix}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-0.5 text-xs font-medium text-gray-400">
      — 0{suffix}
    </span>
  );
}
