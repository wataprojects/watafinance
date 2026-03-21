"use client";

import * as React from "react"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay, isSameMonth, addMonths, subMonths } from "date-fns"
import { es } from "date-fns/locale"
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export interface DatePickerProps {
  date?: Date
  onDateChange?: (date: Date | undefined) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

const DatePicker = ({
  date,
  onDateChange,
  placeholder = "Seleccionar fecha",
  className,
  disabled = false,
}: DatePickerProps) => {
  const [isOpen, setIsOpen] = React.useState(false)
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(date)
  const [currentMonth, setCurrentMonth] = React.useState(date || new Date())

  React.useEffect(() => {
    if (date !== undefined && date !== null) {
      setSelectedDate(date)
      setCurrentMonth(date)
    } else if (date === undefined || date === null) {
      setSelectedDate(undefined)
    }
  }, [date])

  const handleDateSelect = (day: Date) => {
    setSelectedDate(day)
    setCurrentMonth(day)
    if (onDateChange) {
      onDateChange(day)
    }
    setIsOpen(false)
  }

  const handlePrevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1))
  }

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  })

  const startDay = getDay(startOfMonth(currentMonth))

  const weekDays = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]

  return (
    <div className="relative">
      <Button
        type="button"
        variant={"outline"}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full justify-start text-left font-normal bg-slate-700 border-slate-600 text-white hover:bg-slate-600 hover:text-white",
          !selectedDate && "text-muted-foreground",
          className
        )}
        disabled={disabled}
      >
        <CalendarIcon className="mr-2 h-4 w-4" />
        {selectedDate ? (
          format(selectedDate, "PPP", { locale: es })
        ) : (
          <span>{placeholder}</span>
        )}
      </Button>

      {isOpen && (
        <div className="absolute top-full left-0 z-50 mt-2 w-full bg-slate-800 border border-slate-700 rounded-xl p-4 shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-2 rounded-lg hover:bg-slate-700 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
            <span className="text-white font-medium">
              {format(currentMonth, "MMMM yyyy", { locale: es })}
            </span>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-2 rounded-lg hover:bg-slate-700 transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Week days */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map((day) => (
              <div
                key={day}
                className="text-center text-xs text-slate-400 font-medium py-1"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Days */}
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: startDay }).map((_, index) => (
              <div key={`empty-${index}`} className="aspect-square" />
            ))}
            {days.map((day) => {
              const isSelected = selectedDate && isSameDay(day, selectedDate)
              const isToday = isSameDay(day, new Date())
              const isCurrentMonth = isSameMonth(day, currentMonth)

              return (
                <button
                  key={day.toString()}
                  type="button"
                  onClick={() => handleDateSelect(day)}
                  className={cn(
                    "aspect-square rounded-lg text-sm transition-colors flex items-center justify-center",
                    isSelected
                      ? "bg-cyan-500 text-white font-medium"
                      : isToday
                      ? "bg-slate-700 text-white border border-cyan-500"
                      : isCurrentMonth
                      ? "text-white hover:bg-slate-700"
                      : "text-slate-500 hover:bg-slate-700"
                  )}
                >
                  {format(day, "d")}
                </button>
              )
            })}
          </div>

          {/* Quick actions */}
          <div className="flex gap-2 mt-4 pt-3 border-t border-slate-700">
            <button
              type="button"
              onClick={() => {
                const today = new Date()
                setSelectedDate(today)
                setCurrentMonth(today)
                if (onDateChange) {
                  onDateChange(today)
                }
              }}
              className="flex-1 py-2 text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              Hoy
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedDate(undefined)
                if (onDateChange) {
                  onDateChange(undefined)
                }
                setIsOpen(false)
              }}
              className="flex-1 py-2 text-xs text-slate-400 hover:text-slate-300 transition-colors"
            >
              Limpiar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

DatePicker.displayName = "DatePicker"

export { DatePicker }