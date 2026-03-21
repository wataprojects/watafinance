"use client";

import * as React from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Check, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

export type DatePickerProps = {
  date?: Date;
  onDateChange?: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
};

// Arrays para los meses y años
const months = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

const years = Array.from({ length: 50 }, (_, i) => new Date().getFullYear() - 25 + i);

export function DatePicker({
  date,
  onDateChange,
  placeholder = "Seleccionar fecha",
  disabled = false,
}: DatePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(date);
  const [viewMode, setViewMode] = React.useState<"day" | "month" | "year">("day");
  const [tempDate, setTempDate] = React.useState<Date>(date || new Date());

  // Sincronizar cuando cambia la prop date
  React.useEffect(() => {
    if (date) {
      setSelectedDate(date);
      setTempDate(date);
    }
  }, [date]);

  // Generar días del mes
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  // Renderizar días del calendario
  const renderDays = () => {
    const year = tempDate.getFullYear();
    const month = tempDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const days = [];

    // Días vacíos al inicio
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="w-9 h-9" />);
    }

    // Días del mes
    for (let day = 1; day <= daysInMonth; day++) {
      const isSelected = selectedDate && 
        selectedDate.getDate() === day && 
        selectedDate.getMonth() === month && 
        selectedDate.getFullYear() === year;
      
      const isToday = new Date().getDate() === day && 
        new Date().getMonth() === month && 
        new Date().getFullYear() === year;

      days.push(
        <button
          key={day}
          onClick={() => {
            const newDate = new Date(year, month, day);
            setSelectedDate(newDate);
            setTempDate(newDate);
          }}
          className={`
            w-9 h-9 rounded-lg flex items-center justify-center text-sm transition-all
            ${isSelected 
              ? "bg-sky-500 text-white font-bold" 
              : "text-white hover:bg-slate-700"
            }
            ${isToday && !isSelected ? "border border-sky-500 text-sky-400" : ""}
          `}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  // Renderizar meses
  const renderMonths = () => {
    return (
      <div className="grid grid-cols-4 gap-2 p-2">
        {months.map((monthName, index) => {
          const isSelected = selectedDate && 
            selectedDate.getMonth() === index && 
            selectedDate.getFullYear() === tempDate.getFullYear();
          
          return (
            <button
              key={monthName}
              onClick={() => {
                const newDate = new Date(tempDate.getFullYear(), index, tempDate.getDate());
                setTempDate(newDate);
                setSelectedDate(newDate);
                setViewMode("day");
              }}
              className={`
                p-3 rounded-lg text-sm font-medium transition-all
                ${isSelected 
                  ? "bg-sky-500 text-white" 
                  : "text-white hover:bg-slate-700"
                }
              `}
            >
              {monthName.substring(0, 3)}
            </button>
          );
        })}
      </div>
    );
  };

  // Renderizar años
  const renderYears = () => {
    return (
      <div className="grid grid-cols-5 gap-2 p-2 max-h-64 overflow-y-auto">
        {years.map((year) => {
          const isSelected = selectedDate && selectedDate.getFullYear() === year;
          
          return (
            <button
              key={year}
              onClick={() => {
                const newDate = new Date(year, tempDate.getMonth(), tempDate.getDate());
                setTempDate(newDate);
                setSelectedDate(newDate);
                setViewMode("month");
              }}
              className={`
                p-3 rounded-lg text-sm font-medium transition-all
                ${isSelected 
                  ? "bg-sky-500 text-white" 
                  : "text-white hover:bg-slate-700"
                }
              `}
            >
              {year}
            </button>
          );
        })}
      </div>
    );
  };

  // Confirmar fecha
  const handleConfirm = () => {
    setSelectedDate(tempDate);
    if (onDateChange) {
      onDateChange(tempDate);
    }
    setIsOpen(false);
    setViewMode("day");
  };

  // Cancelar
  const handleCancel = () => {
    setTempDate(selectedDate || new Date());
    setViewMode("day");
    setIsOpen(false);
  };

  // Navegación entre meses
  const goToPrevMonth = () => {
    const newDate = new Date(tempDate.getFullYear(), tempDate.getMonth() - 1, 1);
    setTempDate(newDate);
  };

  const goToNextMonth = () => {
    const newDate = new Date(tempDate.getFullYear(), tempDate.getMonth() + 1, 1);
    setTempDate(newDate);
  };

  return (
    <Popover open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) {
        setTempDate(selectedDate || new Date());
        setViewMode("day");
      }
    }}>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={`
            w-full justify-start text-left font-normal bg-slate-700 border-slate-600 text-white hover:bg-slate-600 hover:text-white transition-all
            ${!selectedDate ? "text-slate-400" : ""}
          `}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {selectedDate ? (
            format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: es })
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 bg-white border-slate-200 rounded-xl" align="start">
        <div className="flex flex-col">
          {/* Header según el modo de vista */}
          <div className="flex items-center justify-between p-3 border-b border-slate-700 bg-slate-800/50">
            {viewMode === "day" && (
              <>
                <button
                  onClick={goToPrevMonth}
                  className="p-2 rounded-lg hover:bg-slate-700 text-white transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("month")}
                  className="text-white font-medium hover:text-sky-400 transition-colors"
                >
                  {months[tempDate.getMonth()]} {tempDate.getFullYear()}
                </button>
                <button
                  onClick={goToNextMonth}
                  className="p-2 rounded-lg hover:bg-slate-700 text-white transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </>
            )}
            {viewMode === "month" && (
              <>
                <button
                  onClick={() => setViewMode("year")}
                  className="p-2 rounded-lg hover:bg-slate-700 text-white transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-white font-medium">Seleccionar mes</span>
                <button
                  onClick={() => setViewMode("day")}
                  className="p-2 rounded-lg hover:bg-slate-700 text-white transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </>
            )}
            {viewMode === "year" && (
              <>
                <span className="text-white font-medium col-start-2 text-center">Seleccionar año</span>
                <div className="w-8" />
              </>
            )}
          </div>

          {/* Contenido según el modo */}
          <div className="min-h-[280px]">
            {viewMode === "day" && (
              <>
                {/* Días de la semana */}
                <div className="grid grid-cols-7 gap-1 p-2 border-b border-slate-700/50">
                  {["D", "L", "M", "X", "J", "V", "S"].map((day, i) => (
                    <div key={i} className="w-9 h-6 flex items-center justify-center text-xs text-slate-400 font-medium">
                      {day}
                    </div>
                  ))}
                </div>
                {/* Días del calendario */}
                <div className="grid grid-cols-7 gap-1 p-2">
                  {renderDays()}
                </div>
              </>
            )}
            {viewMode === "month" && renderMonths()}
            {viewMode === "year" && renderYears()}
          </div>

          {/* Footer con botones */}
          <div className="flex items-center justify-between p-3 border-t border-slate-700 bg-slate-800/50">
            <button
              onClick={handleCancel}
              className="flex items-center gap-1 px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors text-sm"
            >
              <X className="w-4 h-4" />
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              className="flex items-center gap-1 px-4 py-2 rounded-lg bg-sky-500 text-white font-medium hover:bg-sky-600 transition-colors text-sm"
            >
              <Check className="w-4 h-4" />
              Aceptar
            </button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default DatePicker;