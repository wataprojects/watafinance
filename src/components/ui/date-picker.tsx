"use client"

import * as React from "react"
import { format, setMonth } from "date-fns"
import { es } from "date-fns/locale"
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Calendar } from "@/components/ui/calendar"

interface DatePickerProps {
  date: Date
  onDateChange: (date: Date) => void
  className?: string
  buttonClassName?: string
  placeholder?: string
}

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

export function DatePicker({
  date,
  onDateChange,
  className,
  buttonClassName,
  placeholder = "Seleccionar fecha"
}: DatePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [currentMonth, setCurrentMonth] = React.useState(date)
  const [selectedYear, setSelectedYear] = React.useState(date.getFullYear())
  const [showYearPicker, setShowYearPicker] = React.useState(false)
  const [showMonthPicker, setShowMonthPicker] = React.useState(false)

  const years = Array.from({ length: 20 }, (_, i) => new Date().getFullYear() - 10 + i)

  const handleSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      onDateChange(selectedDate)
      setIsOpen(false)
      setShowYearPicker(false)
      setShowMonthPicker(false)
    }
  }

  const handleYearSelect = (year: number) => {
    setSelectedYear(year)
    const newDate = new Date(currentMonth)
    newDate.setFullYear(year)
    setCurrentMonth(newDate)
    setShowYearPicker(false)
  }

  const handleMonthSelect = (monthIndex: number) => {
    const newDate = setMonth(currentMonth, monthIndex)
    setCurrentMonth(newDate)
    setShowMonthPicker(false)
  }

  const handleMonthChange = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1)
      } else {
        newDate.setMonth(newDate.getMonth() + 1)
      }
      return newDate
    })
  }

  const today = new Date()

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (!open) {
      setShowYearPicker(false)
      setShowMonthPicker(false)
    }
  }

  const toggleYearPicker = () => {
    if (showYearPicker) {
      setShowYearPicker(false)
    } else {
      setShowYearPicker(true)
      setShowMonthPicker(false)
    }
  }

  const toggleMonthPicker = () => {
    if (showMonthPicker) {
      setShowMonthPicker(false)
    } else {
      setShowMonthPicker(true)
      setShowYearPicker(false)
    }
  }

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setIsOpen(true)}
        className={cn(
          "w-full bg-slate-700 border-slate-600 text-white justify-between hover:bg-slate-600 hover:border-slate-500 transition-all duration-200 font-normal",
          buttonClassName
        )}
      >
        <span className="flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-slate-400" />
          <span className={date ? "text-white" : "text-slate-400"}>
            {date 
              ? format(date, "d 'de' MMMM 'de' yyyy", { locale: es })
              : placeholder
            }
          </span>
        </span>
        <div className="flex items-center gap-1">
          {date && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDateChange(today)
              }}
              className="px-2 py-0.5 hover:bg-slate-600 rounded transition-colors text-xs text-slate-400 hover:text-white"
            >
              HOY
            </button>
          )}
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </div>
      </Button>

      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent 
          className={cn(
            "max-w-[360px] w-[95vw] p-0 bg-slate-800 border-slate-700 shadow-2xl rounded-2xl",
            className
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-slate-800 rounded-t-2xl">
            <button
              onClick={() => handleMonthChange('prev')}
              className="p-2 hover:bg-slate-700 rounded-xl transition-colors text-slate-300 hover:text-white"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-2">
              <button
                onClick={toggleYearPicker}
                className={cn(
                  "px-3 py-1.5 rounded-lg transition-colors text-sm font-semibold",
                  showYearPicker 
                    ? "bg-indigo-600 text-white" 
                    : "text-white hover:bg-slate-700"
                )}
              >
                {format(currentMonth, "yyyy", { locale: es })}
              </button>
              <span className="text-slate-500">|</span>
              <button
                onClick={toggleMonthPicker}
                className={cn(
                  "px-3 py-1.5 rounded-lg transition-colors text-sm font-semibold capitalize",
                  showMonthPicker 
                    ? "bg-indigo-600 text-white" 
                    : "text-white hover:bg-slate-700"
                )}
              >
                {format(currentMonth, "MMMM", { locale: es })}
              </button>
            </div>
            
            <button
              onClick={() => handleMonthChange('next')}
              className="p-2 hover:bg-slate-700 rounded-xl transition-colors text-slate-300 hover:text-white"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Selector de año */}
          {showYearPicker && (
            <div className="p-4 border-b border-slate-700 bg-slate-800">
              <p className="text-xs text-slate-500 mb-2 font-medium">SELECCIONAR AÑO</p>
              <div className="grid grid-cols-4 gap-2 max-h-[200px] overflow-y-auto">
                {years.map((year) => (
                  <button
                    key={year}
                    onClick={() => handleYearSelect(year)}
                    className={cn(
                      "p-2 rounded-lg text-sm font-medium transition-colors",
                      selectedYear === year 
                        ? "bg-indigo-600 text-white" 
                        : "text-slate-300 hover:bg-slate-700 hover:text-white"
                    )}
                  >
                    {year}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Selector de mes */}
          {showMonthPicker && (
            <div className="p-4 border-b border-slate-700 bg-slate-800">
              <p className="text-xs text-slate-500 mb-2 font-medium">SELECCIONAR MES</p>
              <div className="grid grid-cols-4 gap-2">
                {months.map((month) => (
                  <button
                    key={month.value}
                    onClick={() => handleMonthSelect(month.value)}
                    className={cn(
                      "p-2 rounded-lg text-sm font-medium transition-colors capitalize",
                      currentMonth.getMonth() === month.value 
                        ? "bg-indigo-600 text-white" 
                        : "text-slate-300 hover:bg-slate-700 hover:text-white"
                    )}
                  >
                    {month.label.substring(0, 3)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Calendario */}
          {!showYearPicker && !showMonthPicker && (
            <div className="p-2 bg-slate-800">
              <Calendar
                mode="single"
                selected={date}
                onSelect={handleSelect}
                month={currentMonth}
                onMonthChange={setCurrentMonth}
                className="bg-slate-800 text-white rounded-lg"
                classNames={{
                  months: "flex flex-col space-y-4",
                  month: "space-y-4",
                  caption: "flex justify-center pt-1 relative items-center",
                  caption_label: "text-sm font-medium text-white",
                  nav: "space-x-1 flex items-center",
                  nav_button: "h-8 w-8 bg-transparent p-0 opacity-50 hover:opacity-100 hover:bg-slate-700 rounded-lg transition-all",
                  nav_button_previous: "absolute left-2",
                  nav_button_next: "absolute right-2",
                  table: "w-full border-collapse space-y-1",
                  head_row: "flex",
                  head_cell: "text-slate-500 rounded-md w-9 font-normal text-[0.75rem]",
                  row: "flex w-full mt-2",
                  cell: "h-9 w-9 text-center text-sm p-0 relative focus-within:relative focus-within:z-20",
                  day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-slate-700 rounded-lg transition-all text-slate-300 hover:text-white",
                  day_selected: "bg-indigo-600 text-white hover:bg-indigo-600 hover:text-white focus:bg-indigo-600 focus:text-white rounded-lg font-semibold",
                  day_today: "bg-slate-700 text-white rounded-lg font-semibold",
                  day_outside: "text-slate-600 opacity-40",
                  day_disabled: "text-slate-600 opacity-40",
                  day_hidden: "invisible",
                }}
              />
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between gap-2 p-4 border-t border-slate-700 bg-slate-800 rounded-b-2xl">
            <Button
              variant="ghost"
              onClick={() => {
                onDateChange(today)
                setIsOpen(false)
                setShowYearPicker(false)
                setShowMonthPicker(false)
              }}
              className="flex-1 text-slate-400 hover:text-white hover:bg-slate-700"
            >
              Hoy
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setIsOpen(false)
                setShowYearPicker(false)
                setShowMonthPicker(false)
              }}
              className="flex-1 text-slate-400 hover:text-white hover:bg-slate-700"
            >
              Cancelar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}