import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown, X } from 'lucide-react';

const AutocompleteSelect = ({
  label,
  placeholder = 'Type to search...',
  value,
  onChange,
  onSearch,
  options = [],
  error,
  required = false,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const [selectedLabel, setSelectedLabel] = useState('');
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef(null);

  // Sync selected label when value changes or options load
  useEffect(() => {
    if (value) {
      const match = options.find((opt) => String(opt.value) === String(value));
      if (match) {
        setSelectedLabel(match.label);
      }
    } else {
      setSelectedLabel('');
    }
  }, [value, options]);

  // Click outside listener to close dropdown
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Reset active index when list contents change
  useEffect(() => {
    setActiveIndex(-1);
  }, [options, isOpen]);

  // Handle typing inside input search field
  const handleInputChange = (e) => {
    const term = e.target.value;
    setSearchVal(term);
    onSearch(term);
    setIsOpen(true);
  };

  const handleSelectOption = (opt) => {
    onChange(opt.value);
    setSelectedLabel(opt.label);
    setSearchVal('');
    setIsOpen(false);
  };

  const clearSelection = () => {
    onChange('');
    setSelectedLabel('');
    setSearchVal('');
    onSearch('');
  };

  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex((prev) => (prev + 1 < options.length ? prev + 1 : 0));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex((prev) => (prev - 1 >= 0 ? prev - 1 : options.length - 1));
        break;
      case 'Enter':
        e.preventDefault();
        if (activeIndex >= 0 && activeIndex < options.length) {
          handleSelectOption(options[activeIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        break;
      default:
        break;
    }
  };

  return (
    <div className={`flex flex-col gap-1.5 w-full text-left relative ${className}`} ref={containerRef}>
      {label && (
        <label className="text-xs font-bold text-slate-650 uppercase tracking-wider">
          {label} {required && <span className="text-rose-500 font-extrabold">*</span>}
        </label>
      )}

      <div className="relative">
        <input
          type="text"
          value={isOpen ? searchVal : selectedLabel}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            setIsOpen(true);
            onSearch(''); // Fetch default list on focus
          }}
          placeholder={selectedLabel || placeholder}
          className={`w-full pl-3 pr-20 py-2.5 rounded-xl border bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-olive-green/20 focus:border-olive-green text-sm transition-all duration-200 ${
            error ? 'border-rose-450 focus:border-rose-500 focus:ring-rose-500/20' : 'border-slate-350 focus:ring-olive-green/25 focus:border-olive-green'
          }`}
        />

        {/* Action icons right side */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 gap-1.5 text-slate-400">
          {value && (
            <button
              type="button"
              onClick={clearSelection}
              className="p-1 rounded-full hover:bg-slate-100 transition-colors hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <ChevronDown className="w-4 h-4 pointer-events-none" />
        </div>
      </div>

      {/* Floating Options Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-[100%] left-0 right-0 mt-1.5 bg-white border border-slate-200/90 rounded-xl shadow-lg max-h-60 overflow-y-auto z-50 py-1.5">
          {options.length > 0 ? (
            options.map((opt, idx) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleSelectOption(opt)}
                className={`w-full text-left px-4 py-2 text-xs font-medium transition-colors ${
                  idx === activeIndex
                    ? 'bg-olive-green/10 text-primary-brown font-bold'
                    : String(opt.value) === String(value)
                    ? 'bg-light-beige text-primary-brown font-bold'
                    : 'text-slate-650 hover:bg-olive-green/5'
                }`}
              >
                {opt.label}
              </button>
            ))
          ) : (
            <div className="px-4 py-3 text-xs text-slate-400 font-medium text-center">
              No matching records found.
            </div>
          )}
        </div>
      )}

      {error && <p className="text-[10px] text-rose-550 font-bold mt-0.5">{error}</p>}
    </div>
  );
};

export default AutocompleteSelect;
