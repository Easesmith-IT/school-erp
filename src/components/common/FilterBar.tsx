import React from 'react';
import { Search, X, Filter } from 'lucide-react';

export interface FilterOption {
  key: string;
  label: string;
  options: { label: string; value: string }[];
  value: string;
  onChange: (val: string) => void;
}

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  searchPlaceholder?: string;
  filters?: FilterOption[];
  onClearAll?: () => void;
}

export function FilterBar({
  searchQuery,
  onSearchChange,
  searchPlaceholder = 'Search records...',
  filters = [],
  onClearAll,
}: FilterBarProps) {
  const activeFilters = filters.filter((f) => f.value && f.value !== 'ALL' && f.value !== '');
  const hasActiveFilter = searchQuery.trim().length > 0 || activeFilters.length > 0;

  return (
    <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs space-y-3">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-8 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 font-medium"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Dropdowns */}
        <div className="flex items-center gap-2 overflow-x-auto">
          {filters.map((f) => (
            <div key={f.key} className="flex items-center gap-1 shrink-0 text-xs">
              <span className="text-slate-500 font-semibold text-[11px]">{f.label}:</span>
              <select
                value={f.value}
                onChange={(e) => f.onChange(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500"
              >
                {f.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          ))}

          {hasActiveFilter && onClearAll && (
            <button
              onClick={onClearAll}
              className="text-xs font-semibold text-rose-600 hover:text-rose-800 shrink-0 ml-1 px-2 py-1 bg-rose-50 rounded border border-rose-200 hover:bg-rose-100 transition-colors"
            >
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* Active Filter Tags */}
      {activeFilters.length > 0 && (
        <div className="flex items-center gap-1.5 pt-1 border-t border-slate-100 text-xs flex-wrap">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Filters:</span>
          {activeFilters.map((f) => (
            <span
              key={f.key}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 border border-blue-200 text-[11px] font-semibold"
            >
              <span>{f.label}: {f.options.find((o) => o.value === f.value)?.label || f.value}</span>
              <button onClick={() => f.onChange('ALL')} className="hover:text-blue-950">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
