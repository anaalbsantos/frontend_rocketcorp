import React, { useState, useRef, useEffect } from "react";
import { Filter } from "lucide-react";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  filterOptions?: string[];
  onFilterChange?: (filter: string) => void;
  initialFilter?: string;
}

const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  placeholder = "Buscar...",
  className = "",
  filterOptions = [],
  onFilterChange,
  initialFilter,
}) => {
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState(
    initialFilter || (filterOptions.length > 0 ? filterOptions[0] : "")
  );
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setFilterOpen(false);
      }
    }
    if (filterOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [filterOpen]);

  const handleFilterSelect = (filter: string) => {
    setSelectedFilter(filter);
    setFilterOpen(false);
    if (onFilterChange) onFilterChange(filter);
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative flex-grow">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <svg
            className="h-5 w-5 text-gray-400"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <input
          type="text"
          placeholder={placeholder}
          className="block w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-3 leading-5 placeholder-gray-500 focus:border-[#08605f] focus:outline-none focus:ring-[#08605f] sm:text-sm"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>

      {filterOptions.length > 0 && (
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            aria-haspopup="listbox"
            aria-expanded={filterOpen}
            onClick={() => setFilterOpen(!filterOpen)}
            className="flex items-center justify-center rounded-md border border-gray-300 bg-[#08605f] p-2.5 text-white hover:bg-[#064a49] focus:outline-none focus:ring-2 focus:ring-[#08605f]"
            aria-label="Filtros"
            title="Filtros"
          >
            <Filter size={20} />
          </button>

          {filterOpen && (
            <ul
              role="listbox"
              tabIndex={-1}
              className="absolute right-0 mt-1 max-h-48 w-40 overflow-auto rounded-md border border-gray-300 bg-white py-1 text-base shadow-lg focus:outline-none sm:text-sm z-50"
            >
              {filterOptions.map((option) => (
                <li
                  key={option}
                  role="option"
                  aria-selected={selectedFilter === option}
                  onClick={() => handleFilterSelect(option)}
                  className={`cursor-pointer select-none px-4 py-2 ${
                    selectedFilter === option
                      ? "bg-[#08605f] text-white"
                      : "text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  {option}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchInput;