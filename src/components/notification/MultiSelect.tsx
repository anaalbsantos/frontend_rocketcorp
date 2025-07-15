import { useEffect, useState } from "react";

interface MultiSelectOption {
  label: string;
  value: string;
}

interface MultiSelectProps {
  label: string;
  options: MultiSelectOption[];
  selected: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
}

export const MultiSelect = ({
  label,
  options,
  selected,
  onChange,
  placeholder = "Digite para filtrar...",
}: MultiSelectProps) => {
  const [query, setQuery] = useState("");
  const [filtered, setFiltered] = useState<MultiSelectOption[]>(options);

  useEffect(() => {
    if (!query) {
      setFiltered(options);
    } else {
      const lower = query.toLowerCase();
      setFiltered(
        options.filter((opt) => opt.label.toLowerCase().includes(lower))
      );
    }
  }, [query, options]);

  const toggleValue = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  const isAllSelected = selected.length === options.length;

  const toggleAll = () => {
    if (isAllSelected) {
      onChange([]);
    } else {
      onChange(options.map((opt) => opt.value));
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>

      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="w-full border border-gray-300 rounded-lg p-3 text-sm bg-white text-black focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-sm"
      />

      <div className="border border-gray-300 rounded-lg max-h-44 overflow-y-auto bg-gray-50 p-2 space-y-1 text-sm shadow-sm scrollbar">
        <label className="flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-100 cursor-pointer">
          <input
            type="checkbox"
            checked={isAllSelected}
            onChange={toggleAll}
            className="accent-emerald-600"
          />
          <span className="font-medium">Selecionar todos</span>
        </label>

        {filtered.map((opt) => (
          <label
            key={opt.value}
            className="flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-100 cursor-pointer"
          >
            <input
              type="checkbox"
              checked={selected.includes(opt.value)}
              onChange={() => toggleValue(opt.value)}
              className="accent-emerald-600"
            />
            <span>{opt.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
};
