"use client";

import * as React from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface DatePickerProps {
  date?: Date;
  onDateChange: (date: Date) => void;
  placeholder?: string;
}

export function DatePicker({
  date,
  onDateChange,
  placeholder = "Selecciona una fecha",
}: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start rounded-xl border-zinc-700 bg-zinc-800 text-left font-normal text-white hover:bg-zinc-700 hover:text-white",
            !date && "text-zinc-400",
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 text-zinc-400" />
          {date ? format(date, "PPP", { locale: es }) : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto rounded-2xl border-zinc-700 bg-zinc-900 p-3 text-white shadow-2xl"
        align="start"
      >
        <Calendar
          mode="single"
          selected={date}
          onSelect={(selectedDate) => {
            if (selectedDate) {
              onDateChange(selectedDate);
            }
          }}
          className="bg-zinc-900 text-white"
        />
      </PopoverContent>
    </Popover>
  );
}