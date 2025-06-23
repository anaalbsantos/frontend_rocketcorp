import { useState } from "react";
import {
  Command,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import Avatar from "./Avatar";

interface Colaborator {
  id: string;
  name: string;
  position: string;
}

interface SearchColaboratorProps {
  colaborators: Colaborator[];
  selected: Colaborator | null;
  setSelected: React.Dispatch<React.SetStateAction<Colaborator | null>>;
}

export function SearchColaborators({
  colaborators,
  selected,
  setSelected,
}: SearchColaboratorProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className="w-full border px-4 py-2 rounded-xl text-start text-text-primary bg-white"
          onClick={() => setOpen(!open)}
        >
          {selected?.name || "Selecione um colaborador"}
        </button>
      </PopoverTrigger>
      <PopoverContent className="min-w-[var(--radix-popover-trigger-width)] w-auto p-0">
        <Command>
          <CommandInput placeholder="Buscar..." />
          <CommandList>
            {colaborators.map((option) => (
              <CommandItem
                key={option.name}
                value={option.name}
                onSelect={(value) => {
                  setSelected(
                    colaborators.find((x) => x.name === value) || null
                  );
                  setOpen(false);
                }}
                className="flex gap-3 p-2"
              >
                <Avatar name={option.name} />
                <div className="flex flex-col">
                  <p className="font-semibold">{option.name}</p>
                  <p className="text-xs text-text-muted">{option.position}</p>
                </div>
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
