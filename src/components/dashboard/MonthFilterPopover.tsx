"use client";

import { useState } from "react";
import { Filter, Calendar as CalendarIcon, X, ChevronDown } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

interface MonthFilterPopoverProps {
  filterMonth: string;
  filterYear: string;
  onMonthChange: (month: string) => void;
  onYearChange: (year: string) => void;
  variant?: "default" | "expenses" | "debts";
}

const months = [
  { value: "all", label: "Todos los meses" },
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

const years = ["2024", "2025", "2026", "2027", "2028"];

const MonthFilterPopover = ({
  filterMonth,
  filterYear,
  onMonthChange,
  onYearChange,
  variant = "default",
}: MonthFilterPopoverProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(() => {
    if (filterMonth === "all" || !filterMonth) {
      return new Date();
    }
    const year = parseInt(filterYear || new Date().getFullYear().toString());
    const month = parseInt(filterMonth) - 1;
    return new Date(year, month, 1);
  });

  const getVariantStyles = () => {
    switch (variant) {
      case "expenses":
        return {
          button: "bg-red-500 hover:bg-red-600 text-white",
          icon: "text-white",
          popover: "border-red-800",
        };
      case "debts":
        return {
          button: "bg-amber-500 hover:bg-amber-600 text-black",
          icon: "text-black",
          border: "border-amber-800",
        };
      default:
        return {
          button: "bg-green-500 hover:bg-green-600 text-black",
          icon: "text-black",
          border: "border-green-800",
        };
    }
  };

  const styles = getVariantStyles();

  const getDisplayText = () => {
    if (filterMonth === "all") {
      return "Todos los meses";
    }
    const monthLabel = months.find((m) => m.value === filterMonth)?.label || "";
    return `${monthLabel} ${filterYear}`;
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;
    setSelectedDate(date);
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear().toString();
    onMonthChange(month);
    onYearChange(year);
  };

  const handleAllMonths = () => {
    onMonthChange("all");
    setSelectedDate(new Date());
  };

  const handleMonthSelect = (monthValue: string) => {
    if (monthValue === "all") {
      handleAllMonths();
    } else {
      const year = parseInt(filterYear);
      const month = parseInt(monthValue) - 1;
      const newDate = new Date(year, month, 1);
      setSelectedDate(newDate);
      onMonthChange(monthValue);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "flex items-center gap-2 px-3 py-2 bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-zinc-200 min-w-[140px] justify-between",
            styles.button
          )}
        >
          <div className="flex items-center gap-2">
            <Filter className={cn("w-4 h-4", styles.icon)} />
            <span className="text-sm font-medium">{getDisplayText()}</span>
          </div>
          <ChevronDown className="w-4 h-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className={cn(
          "w-auto p-0 bg-zinc-900 border-zinc-700",
          styles.border
        )}
        align="end"
      >
        <div className="flex flex-col">
          {/* Calendar */}
          <div className="p-3 border-b border-zinc-700">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              fromYear={2024}
              toYear={2028}
              captionLayout="dropdown"
              className="bg-zinc-900 text-white"
            />
          </div>

          {/* Quick select options */}
          <div className="p-3 space-y-2">
            <p className="text-xs text-zinc-500 font-medium">Selección rápida</p>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant={filterMonth === "all" ? "default" : "outline"}
                onClick={handleAllMonths}
                size="sm"
                className={cn(
                  "text-xs",
                  filterMonth === "all"
                    ? styles.button
                    : "bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700"
                )}
              >
                Todos
              </Button>
              <Button
                variant={filterMonth === new Date().getMonth().toString().padStart(2, "0") ? "default" : "outline"}
                onClick={() =>
                  handleMonthSelect(
                    (new Date().getMonth() + 1).toString().padStart(2, "0")
                  )
                }
                size="sm"
                className={cn(
                  "text-xs",
                  filterMonth === new Date().getMonth().toString().padStart(2, "0")
                    ? styles.button
                    : "bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700"
                )}
              >
                Este mes
              </Button>
            </div>

            {/* Month selector */}
            <p className="text-xs text-zinc-500 font-medium mt-2">Mes</p>
            <div className="grid grid-cols-3 gap-1 max-h-[150px] overflow-y-auto">
              {months.slice(1).map((month) => (
                <Button
                  key={month.value}
                  variant={filterMonth === month.value ? "default" : "ghost"}
                  onClick={() => handleMonthSelect(month.value)}
                  size="sm"
                  className={cn(
                    "text-xs py-1 px-1",
                    filterMonth === month.value
                      ? styles.button
                      : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                  )}
                >
                  {month.label.slice(0, 3)}
                </Button>
              ))}
            </div>

            {/* Year selector */}
            <p className="text-xs text-zinc-500 font-medium mt-2">Año</p>
            <div className="flex gap-1">
              {years.map((year) => (
                <Button
                  key={year}
                  variant={filterYear === year ? "default" : "ghost"}
                  onClick={() => onYearChange(year)}
                  size="sm"
                  className={cn(
                    "text-xs py-1 px-2",
                    filterYear === year
                      ? styles.button
                      : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                  )}
                >
                  {year}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default MonthFilterPopover;