"use client";

import * as React from "react"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay, isSameMonth, addMonths, subMonths, getYear, setYear, getMonth, setMonth } from "date-fns"
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

type PickerMode = "day" | "month" | "year"

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
  const [pickerMode, setPickerMode] = React.useState<PickerMode>("day")

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

  const handlePrev = () => {
    if (pickerMode === "day") {
      setCurrentMonth(subMonths(currentMonth, 1))
    } else if (pickerMode === "month") {
      setCurrentMonth(subMonths(currentMonth, 12))
    } else {
      setCurrentMonth(subMonths(currentMonth, 12 * 10))
    }
  }

  const handleNext = () => {
    if (pickerMode === "day") {
      setCurrentMonth(addMonths(currentMonth, 1))
    } else if (pickerMode === "month") {
      setCurrentMonth(addMonths(currentMonth, 12))
    } else {
      setCurrentMonth(addMonths(currentMonth, 12 * 10))
    }
  }

  const handleYearSelect = (year: number) => {
    const newDate = setYear(currentMonth, year)
    setCurrentMonth(newDate)
    setPickerMode("month")
  }

  const handleMonthSelect = (month: number) => {
    const newDate = setMonth(currentMonth, month)
    setCurrentMonth(newDate)
    setPickerMode("day")
  }

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  })

  const startDay = getDay(startOfMonth(currentMonth))

  const weekDays = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]

  const currentYear = getYear(currentMonth)
  const years = Array.from({ length: 20 }, (_, i) => currentYear - 10 + i)

  const months = [
    { value: 0, label: "Enero" },
    { value: 1, label: "Febrero" },
    { value: 2, label: "Marzo" },
    { value: 3, label: "Abril" },
    { value: 4, label: "Mayo" },
    { value: 5, label: "Junio" },
    { value: 6, label: "Julio" },
    { value: 7, label: "Agosto" },
    { value: 8, label: "Septiembre" },
    { value: 9, label: "Octubre" },
    { value: 10, label: "Noviembre" },
    { value: 11, label: "Diciembre" },
  ]

  const getHeaderText = () => {
    if (pickerMode === "year") {
      const startYear = years[0]
      const endYear = years[years.length - 1]
      return `${startYear} - ${endYear}`
    }
    return null
  }

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
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Popup */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <button
                  type="button"
                  onClick={handlePrev}
                  className="p-2 rounded-xl hover:bg-slate-700 transition-colors"
                >
                  <ChevronLeft className="w-6 h-6 text-white" />
                </button>
                
                <div className="flex items-center gap-2">
                  {pickerMode === "day" ? (
                    <>
                      <button
                        type="button"
                        onClick={() => setPickerMode("month")}
                        className="text-xl font-bold text-white hover:text-cyan-400 transition-colors capitalize"
                      >
                        {format(currentMonth, "MMMM", { locale: es })}
                      </button>
                      <span className="text-xl font-bold text-white">-</span>
                      <button
                        type="button"
                        onClick={() => setPickerMode("year")}
                        className="text-xl font-bold text-white hover:text-cyan-400 transition-colors"
                      >
                        {format(currentMonth, "yyyy", { locale: es })}
                      </button>
                    </>
                  ) : (
                    <span className="text-xl font-bold text-white">
                      {getHeaderText()}
                    </span>
                  )}
                </div>
                
                <button
                  type="button"
                  onClick={handleNext}
                  className="p-2 rounded-xl hover:bg-slate-700 transition-colors"
                >
                  <ChevronRight className="w-6 h-6 text-white" />
                </button>
              </div>

              {pickerMode === "year" && (
                /* Selector de año */
                <div className="grid grid-cols-4 gap-2 max-h-64 overflow-y-auto">
                  {years.map((year) => (
                    <button
                      key={year}
                      type="button"
                      onClick={() => handleYearSelect(year)}
                      className={cn(
                        "py-3 rounded-xl text-sm font-medium transition-colors",
                        year === currentYear
                          ? "bg-cyan-500 text-white"
                          : "text-slate-300 hover:bg-slate-700"
                      )}
                    >
                      {year}
                    </button>
                  ))}
                </div>
              )}

              {pickerMode === "month" && (
                /* Selector de mes */
                <div className="grid grid-cols-3 gap-2">
                  {months.map((month) => (
                    <button
                      key={month.value}
                      type="button"
                      onClick={() => handleMonthSelect(month.value)}
                      className={cn(
                        "py-3 rounded-xl text-sm font-medium transition-colors capitalize",
                        month.value === getMonth(currentMonth)
                          ? "bg-cyan-500 text-white"
                          : "text-slate-300 hover:bg-slate-700"
                      )}
                    >
                      {month.label}
                    </button>
                  ))}
                </div>
              )}

              {pickerMode === "day" && (
                <>
                  {/* Week days */}
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {weekDays.map((day) => (
                      <div
                        key={day}
                        className="text-center text-sm text-slate-400 font-medium py-2"
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
                            "aspect-square rounded-xl text-lg font-medium transition-colors flex items-center justify-center",
                            isSelected
                              ? "bg-cyan-500 text-white"
                              : isToday
                              ? "bg-slate-700 text-white border-2 border-cyan-500"
                              : isCurrentMonth
                              ? "text-white hover:bg-slate-700"
                              : "text-slate-600 hover:bg-slate-700"
                          )}
                        >
                          {format(day, "d")}
                        </button>
                      )
                    })}
                  </div>
                </>
              )}

              {/* Quick actions */}
              <div className="flex gap-3 mt-6 pt-4 border-t border-slate-700">
                <button
                  type="button"
                  onClick={() => {
                    const today = new Date()
                    setSelectedDate(today)
                    setCurrentMonth(today)
                    setPickerMode("day")
                    if (onDateChange) {
                      onDateChange(today)
                    }
                  }}
                  className="flex-1 py-3 rounded-xl bg-slate-700 text-white font-medium hover:bg-slate-600 transition-colors"
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
                  className="flex-1 py-3 rounded-xl bg-slate-700 text-white font-medium hover:bg-slate-600 transition-colors"
                >
                  Limpiar
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 py-3 rounded-xl bg-cyan-500 text-white font-medium hover:bg-cyan-600 transition-colors"
                >
                  Aceptar
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

DatePicker.displayName = "DatePicker"

export { DatePicker }