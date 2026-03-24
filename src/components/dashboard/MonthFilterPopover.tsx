"use client";

import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Filter, Calendar as CalendarIcon, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface MonthFilterPopoverProps {
  filterMonth: string;
  filterYear: string;
  onMonthChange: (month: string) => void;
  onYearChange: (year: string) => void;
  className?: string;
}

const months = [
  { value: "all", label: "Todos" },
  { value: "01", label: "Enero" },
  { value: "02", label: "Febrero" },
  { value: "03", label: "Marzo" },
  { value: "04", label: "Abril" },
  { value: "05", label: "Mayo" },
  { value: "06", label: "Junio" },
  { value: "07", label: "Julio" },
  { value: "08", label: "Agosto" },
  { value: "09", label: "Septiembre" },
  { value: "10", label: "Octubre" },
  { value: "11", label: "Noviembre" },
  { value: "12", label: "Diciembre" },
];

const years = [2024, 2025, 2026, 2027, 2028];

const MonthFilterPopover = ({
  filterMonth,
  filterYear,
  onMonthChange,
  onYearChange,
  className,
}: MonthFilterPopoverProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [showAllMonths, setShowAllMonths] = useState(filterMonth === "all");

  // Initialize with current month/year
  useEffect(() => {
    if (filterMonth !== "all" && filterYear) {
      const month = parseInt(filterMonth) - 1; // Calendar uses 0-indexed months
      const year = parseInt(filterYear);
      setSelectedDate(new Date(year, month, 1));
    } else {
      setSelectedDate(new Date());
    }
    setShowAllMonths(filterMonth === "all");
  }, [filterMonth, filterYear]);

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;
    
    setSelectedDate(date);
    setShowAllMonths(false);
    onMonthChange((date.getMonth() + 1).toString().padStart(2, "0"));
    onYearChange(date.getFullYear().toString());
  };

  const handleShowAllMonths = () => {
    setShowAllMonths(true);
    onMonthChange("all");
    onYearChange("all");
  };

  const getDisplayText = () => {
    if (showAllMonths || filterMonth === "all") {
      return "Todos los meses";
    }
    const monthLabel = months.find((m) => m.value === filterMonth)?.label || "";
    return `${monthLabel} ${filterYear}`;
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "flex items-center gap-2 bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700 hover:border-zinc-600 transition-all",
            className
          )}
        >
          <Filter className="w-4 h-4" />
          <span className="hidden sm:inline">Filtrar</span>
          <span className="sm:hidden">Filtro</span>
          <div className="ml-1 px-1.5 py-0.5 bg-zinc-700 rounded text-xs">
            {showAllMonths || filterMonth === "all" ? "Todos" : filterMonth}
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0 bg-zinc-900 border-zinc-800"
        align="end"
        sideOffset={4}
      >
        <div className="flex flex-col space-y-3 p-4">
          {/* Header with current selection */}
          <div className="flex items-center justify-between border-b border-zinc-700 pb-3">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-zinc-400" />
              <span className="text-sm font-medium text-white">
                {getDisplayText()}
              </span>
            </div>
          </div>

          {/* Calendar */}
          <div className="flex justify-center">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              fromYear={2024}
              toYear={2028}
              className="rounded-md"
              classNames={{
                months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                month: "space-y-4",
                caption: "flex justify-center pt-1 relative items-center",
                caption_label: "text-sm font-medium text-white",
                nav: "space-x-1 flex items-center",
                nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 text-white hover:bg-zinc-800 rounded",
                nav_button_previous: "absolute left-1",
                nav_button_next: "absolute right-1",
                table: "w-full border-collapse space-y-1",
                head_row: "flex",
                head_cell: "text-zinc-500 rounded-md w-9 font-normal text-[0.8rem]",
                row: "flex w-full mt-2",
                cell: "h-9 w-9 text-center text-sm p-0 relative focus-within:relative focus-within:z-20",
                day: "h-9 w-9 p-0 font-normal text-white hover:bg-zinc-800 rounded",
                day_selected: "bg-green-500 text-black hover:bg-green-600 hover:text-black focus:bg-green-500 focus:text-black",
                day_today: "bg-zinc-800 text-white",
                day_outside: "text-zinc-600 opacity-50",
                day_disabled: "text-zinc-600 opacity-50",
                day_hidden: "invisible",
              }}
            />
          </div>

          {/* Quick year selector */}
          <div className="flex items-center justify-center gap-2 pt-2 border-t border-zinc-700">
            <select
              value={filterYear}
              onChange={(e) => {
                onYearChange(e.target.value);
                if (selectedDate && !showAllMonths) {
                  const newDate = new Date(
                    parseInt(e.target.value),
                    selectedDate.getMonth(),
                    1
                  );
                  setSelectedDate(newDate);
                }
              }}
              className="bg-zinc-800 border border-zinc-700 text-white text-sm rounded px-2 py-1 focus:outline-none focus:border-green-500"
            >
              {years.map((year) => (
                <option key={year} value={year.toString()}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          {/* All months option */}
          <div className="pt-2 border-t border-zinc-700">
            <button
              onClick={handleShowAllMonths}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all",
                showAllMonths
                  ? "bg-green-500/20 border border-green-500/50"
                  : "bg-zinc-800 hover:bg-zinc-700 border border-zinc-700"
              )}
            >
              <span
                className={cn(
                  "text-sm font-medium",
                  showAllMonths ? "text-green-400" : "text-white"
                )}
              >
                Todos los meses
              </span>
              {showAllMonths && <Check className="w-4 h-4 text-green-400" />}
            </button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default MonthFilterPopover;