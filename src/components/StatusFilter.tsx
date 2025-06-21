import { Filter } from "lucide-react";
import React, { useState, useRef, useEffect } from "react";

interface StatusFilterProps {
  value: "Todos" | "Pendente" | "Finalizada";
  onChange: (value: "Todos" | "Pendente" | "Finalizada") => void;
}

const StatusFilter: React.FC<StatusFilterProps> = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const options: {
    label: string;
    value: "Todos" | "Pendente" | "Finalizada";
  }[] = [
    { label: "Todos", value: "Todos" },
    { label: "Avaliações pendentes", value: "Pendente" },
    { label: "Avaliações finalizadas", value: "Finalizada" },
  ];

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="p-2.5 rounded-md bg-[#08605f] text-white hover:bg-[#064a49] focus:outline-none focus:ring-2 focus:ring-[#08605f] focus:ring-opacity-50"
      >
        <Filter size={20} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-40 bg-white border rounded shadow-lg z-50">
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
              className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                value === option.value
                  ? "font-semibold text-[#08605f]"
                  : "text-gray-700"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default StatusFilter;
