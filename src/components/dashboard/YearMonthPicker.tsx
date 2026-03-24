"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronDown, X } from "lucide-react";

interface YearMonthPickerProps {
  selectedMonth: string;
  selectedYear: string;
  setSelectedMonth: (month: string) => void;
  setSelectedYear: (year: string) => void;
}

const currentYear = new Date().getFullYear();
const years = Array.from({ length: currentYear - 1990 + 1 }, (_, i) => currentYear - i);

const months = [
  { value: "01", label: "Ene" },
  { value: "02", label: "Feb" },
  { value: "03", label: "Mar" },
  { value: "04", label: "Abr" },
  { value: "05", label: "May" },
  { value: "06", label: "Jun" },
  { value: "07", label: "Jul" },
  { value: "08", label: "Ago" },
  { value: "09", label: "Sep" },
  { value: "10", label: "Oct" },
  { value: "11", label: "Nov" },
  { value: "12", label: "Dic" },
];

const getMonthLabel = (value: string) => {
  const month = months.find(m => m.value === value);
  return month ? month.label : value;
};

const getFullMonthLabel = (value: string) => {
  const fullMonths = [
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
  const month = fullMonths.find(m => m.value === value);
  return month ? month.label : value;
};

const YearMonthPicker = ({
  selectedMonth,
  selectedYear,
  setSelectedMonth,
  setSelectedYear,
}: YearMonthPickerProps) => {
  const [isYearOpen, setIsYearOpen] = useState(false);
  const [isMonthOpen, setIsMonthOpen] = useState(false);

  const handleSelectYear = (year: string) => {
    setSelectedYear(year);
    setIsYearOpen(false);
  };

  const handleSelectMonth = (month: string) => {
    setSelectedMonth(month);
    setIsMonthOpen(false);
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Selector de Año */}
      <Dialog open={isYearOpen} onOpenChange={setIsYearOpen}>
        <DialogTrigger asChild>
          <button
            type="button"
            className="w-full p-4 bg-zinc-800 border-2 border-zinc-700 rounded-xl flex items-center justify-between hover:border-zinc-600 transition-all group"
          >
            <span className="text-zinc-400 text-sm group-hover:text-zinc-300">Año</span>
            <div className="flex items-center gap-2">
              <span className="text-white font-semibold text-lg">{selectedYear}</span>
              <ChevronDown className="w-4 h-4 text-zinc-500" />
            </div>
          </button>
        </DialogTrigger>
        <DialogContent className="bg-zinc-900 border-zinc-800 max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-white">Seleccionar Año</DialogTitle>
          </DialogHeader>
          <button
            onClick={() => setIsYearOpen(false)}
            className="absolute right-4 top-4 p-1.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white z-10"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="grid grid-cols-4 gap-2 mt-4 max-h-[300px] overflow-y-auto pr-1">
            {years.map((year) => (
              <button
                key={year}
                type="button"
                onClick={() => handleSelectYear(year.toString())}
                className={`
                  p-3 rounded-xl border-2 transition-all font-medium text-sm
                  ${selectedYear === year.toString()
                    ? "border-green-500 bg-green-500/20 text-green-400"
                    : "border-zinc-700 bg-zinc-800 text-zinc-300 hover:border-zinc-600 hover:bg-zinc-700"
                  }
                `}
              >
                {year}
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Selector de Mes */}
      <Dialog open={isMonthOpen} onOpenChange={setIsMonthOpen}>
        <DialogTrigger asChild>
          <button
            type="button"
            className="w-full p-4 bg-zinc-800 border-2 border-zinc-700 rounded-xl flex items-center justify-between hover:border-zinc-600 transition-all group"
          >
            <span className="text-zinc-400 text-sm group-hover:text-zinc-300">Mes</span>
            <div className="flex items-center gap-2">
              <span className="text-white font-semibold text-lg">{getMonthLabel(selectedMonth)}</span>
              <ChevronDown className="w-4 h-4 text-zinc-500" />
            </div>
          </button>
        </DialogTrigger>
        <DialogContent className="bg-zinc-900 border-zinc-800 max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-white">Seleccionar Mes</DialogTitle>
          </DialogHeader>
          <button
            onClick={() => setIsMonthOpen(false)}
            className="absolute right-4 top-4 p-1.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white z-10"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="grid grid-cols-3 gap-2 mt-4">
            {months.map((month) => (
              <button
                key={month.value}
                type="button"
                onClick={() => handleSelectMonth(month.value)}
                className={`
                  p-3 rounded-xl border-2 transition-all font-medium text-sm
                  ${selectedMonth === month.value
                    ? "border-green-500 bg-green-500/20 text-green-400"
                    : "border-zinc-700 bg-zinc-800 text-zinc-300 hover:border-zinc-600 hover:bg-zinc-700"
                  }
                `}
              >
                {month.label}
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default YearMonthPicker;