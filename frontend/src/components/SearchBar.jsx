import React from 'react';
import { Search, X } from 'lucide-react';

const SearchBar = ({
  value,
  onChange,
  onClear,
  placeholder = 'Search...',
  categoryValue = '',
  onCategoryChange,
  categories = [],
  statusValue = '',
  onStatusChange,
  className = '',
}) => {
  return (
    <div className={`flex flex-col sm:flex-row gap-3 items-center w-full ${className}`}>
      <div className="relative w-full">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
          <Search className="w-5 h-5" />
        </span>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-olive-green/20 focus:border-olive-green transition-all duration-200"
        />
        {value && (
          <button
            onClick={onClear}
            className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-655 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {onCategoryChange && categories.length > 0 && (
        <div className="w-full sm:w-60">
          <select
            value={categoryValue}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-olive-green/20 focus:border-olive-green transition-all duration-200"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {onStatusChange && (
        <div className="w-full sm:w-48">
          <select
            value={statusValue}
            onChange={(e) => onStatusChange(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-olive-green/20 focus:border-olive-green transition-all duration-200"
          >
            <option value="">All Statuses</option>
            <option value="available">Available</option>
            <option value="out_of_stock">Out of Stock</option>
          </select>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
