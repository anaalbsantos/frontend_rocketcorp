import * as React from "react";
import { Calendar1Icon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function DatePicker({
  value,
  onChange,
  error,
}: {
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  error: boolean;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          id="date"
          className={
            "w-full h-10 justify-between font-normal" +
            (error ? " border-red-500" : "")
          }
        >
          {value ? value.toLocaleDateString() : "Selecione uma data"}
          <Calendar1Icon />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto overflow-hidden p-0" align="start">
        <Calendar
          mode="single"
          selected={value}
          captionLayout="dropdown"
          onSelect={(date) => {
            onChange?.(date);
            setOpen(false);
          }}
          disabled={(date) => date < new Date()}
        />
      </PopoverContent>
    </Popover>
  );
}
