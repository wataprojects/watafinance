"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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

const YearMonthPicker = ({
  selectedMonth,
  selectedYear,
  setSelectedMonth,
  setSelectedYear,
}: YearMonthPickerProps) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Selector de Año */}
      <Select value={selectedYear} onValueChange={setSelectedYear}>
        <SelectTrigger className="w-full p-4 h-auto bg-zinc-800 border-2 border-zinc-700 rounded-xl flex items-center justify-between hover:border-zinc-600 transition-all group">
          <span className="text-zinc-400 text-sm group-hover:text-zinc-300">Año</span>
          <div className="flex items-center gap-2">
            <span className="text-white font-semibold text-lg">{selectedYear}</span>
          </div>
        </SelectTrigger>
        <SelectContent className="bg-zinc-900 border-zinc-800 max-h-[300px]">
          {years.map((year) => (
            <SelectItem key={year} value={year.toString()} className="text-white">
              {year}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Selector de Mes */}
      <Select value={selectedMonth} onValueChange={setSelectedMonth}>
        <SelectTrigger className="w-full p-4 h-auto bg-zinc-800 border-2 border-zinc-700 rounded-xl flex items-center justify-between hover:border-zinc-600 transition-all group">
          <span className="text-zinc-400 text-sm group-hover:text-zinc-300">Mes</span>
          <div className="flex items-center gap-2">
            <span className="text-white font-semibold text-lg">{getMonthLabel(selectedMonth)}</span>
          </div>
        </SelectTrigger>
        <SelectContent className="bg-zinc-900 border-zinc-800">
          {months.map((month) => (
            <SelectItem key={month.value} value={month.value} className="text-white">
              {month.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default YearMonthPicker;