"use client";

import * as React from "react";
import { format, addMonths, subMonths, getDaysInMonth, startOfMonth, getDay, isSameDay, isToday } from "date-fns";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DatePickerProps {
  date: Date;
  onDateChange: (date: Date | undefined) => void;
  placeholder?: string;
  className?: string;
}

export function DatePicker({ date, onDateChange, placeholder, className }: DatePickerProps) {
  const [currentMonth, setCurrentMonth] = React.useState(date || new Date());
  const [isOpen, setIsOpen] = React.useState(false);

  const daysOfWeek = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  const days = getDaysInMonth(currentMonth);
  const firstDayOfMonth = getDay(startOfMonth(currentMonth));

  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const handleDateClick = (day: number) => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    onDateChange(newDate);
    setIsOpen(false);
  };

  const handleInputClick = () => setIsOpen(!isOpen);

  const handleOverlayClick = () => setIsOpen(false);

  return (
    <div className={cn("relative", className)}>
      <div
        onClick={handleInputClick}
        className="w-full min-h-[40px] px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg cursor-pointer flex items-center justify-between hover:border-zinc-600 transition-colors"
      >
        <span className={date ? "text-white" : "text-zinc-500"}>
          {date ? format(date, "dd/MM/yyyy") : placeholder || "Seleccionar fecha"}
        </span>
        <div className="flex gap-1">
          {date && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDateChange(new Date());
              }}
              className="text-xs text-zinc-400 hover:text-white px-1"
            >
              Hoy
            </button>
          )}
        </div>
      </div>

      {isOpen && (
        <>
          {/* Overlay oscuro */}
          <div 
            className="fixed inset-0 bg-black/50 z-40"
            onClick={handleOverlayClick}
          />
          
          {/* Calendario centrado */}
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[300px] bg-white rounded-2xl shadow-2xl border border-zinc-200 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-zinc-50 border-b border-zinc-200">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1.5 rounded-lg hover:bg-zinc-200 transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-zinc-700" />
              </button>
              <span className="font-semibold text-zinc-900 text-base">
                {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </span>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1.5 rounded-lg hover:bg-zinc-200 transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-zinc-700" />
              </button>
            </div>

            {/* Days of week */}
            <div className="grid grid-cols-7 gap-1 px-3 pt-3 bg-zinc-50">
              {daysOfWeek.map((day) => (
                <div key={day} className="text-center text-xs font-medium text-zinc-500 py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar days */}
            <div className="grid grid-cols-7 gap-1 px-3 pb-3">
              {/* Empty cells for days before first day of month */}
              {Array.from({ length: firstDayOfMonth }).map((_, index) => (
                <div key={`empty-${index}`} className="h-10" />
              ))}

              {/* Days of month */}
              {Array.from({ length: days }).map((_, index) => {
                const day = index + 1;
                const currentDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
                const isSelected = date && isSameDay(currentDate, date);
                const isTodayDate = isToday(currentDate);

                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleDateClick(day)}
                    className={cn(
                      "h-10 rounded-xl text-sm font-medium transition-all flex items-center justify-center",
                      isSelected
                        ? "bg-zinc-900 text-white"
                        : isTodayDate
                          ? "bg-zinc-200 text-zinc-900"
                          : "text-zinc-900 hover:bg-zinc-100"
                    )}
                  >
                    {day}
                  </button>
                );
              })}
            </div>

            {/* Footer with quick actions */}
            <div className="flex justify-between px-4 py-3 bg-zinc-50 border-t border-zinc-200">
              <button
                type="button"
                onClick={() => {
                  onDateChange(new Date());
                  setIsOpen(false);
                }}
                className="text-sm text-zinc-600 hover:text-zinc-900 font-medium px-3 py-1.5 rounded-lg hover:bg-zinc-200 transition-colors"
              >
                Hoy
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-sm text-zinc-600 hover:text-zinc-900 font-medium px-3 py-1.5 rounded-lg hover:bg-zinc-200 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default DatePicker;