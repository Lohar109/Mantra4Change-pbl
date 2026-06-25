import type { AvailableFilters } from '../../types/pbl.types';

interface FilterBarProps {
  filters: AvailableFilters;
  selected: { month: string; district: string; block: string; subject: string };
  onChange: (key: string, value: string) => void;
}

export function FilterBar({ filters, selected, onChange }: FilterBarProps) {
  return (
    <div className="flex flex-wrap gap-3 items-center bg-white rounded-xl border border-gray-200 p-3 shadow-sm">
      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide mr-1">Filters:</span>

      <select
        className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
        value={selected.month}
        onChange={e => onChange('month', e.target.value)}
      >
        <option value="">All Months</option>
        {filters.months.map(m => (
          <option key={m} value={m}>{m}</option>
        ))}
      </select>

      <select
        className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
        value={selected.district}
        onChange={e => onChange('district', e.target.value)}
      >
        <option value="">All Districts</option>
        {filters.districts.map(d => (
          <option key={d} value={d}>{d}</option>
        ))}
      </select>

      <select
        className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
        value={selected.block}
        onChange={e => onChange('block', e.target.value)}
      >
        <option value="">All Blocks</option>
        {filters.blocks.map(b => (
          <option key={b} value={b}>{b}</option>
        ))}
      </select>

      <select
        className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
        value={selected.subject}
        onChange={e => onChange('subject', e.target.value)}
      >
        <option value="">All Subjects</option>
        {filters.subjects.map(s => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>

      {(selected.month || selected.district || selected.block || selected.subject) && (
        <button
          className="text-xs text-gray-400 hover:text-gray-600 underline ml-auto"
          onClick={() => {
            onChange('month', '');
            onChange('district', '');
            onChange('block', '');
            onChange('subject', '');
          }}
        >
          Clear all
        </button>
      )}
    </div>
  );
}
