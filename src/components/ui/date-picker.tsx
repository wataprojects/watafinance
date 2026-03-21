"use client"

import * as React from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"

interface DatePickerProps {
  date: Date
  onDateChange: (date: Date) => void
  className?: string
  buttonClassName?: string
  placeholder?: string
}

export function DatePicker({
  date,
  onDateChange,
  className,
  buttonClassName,
  placeholder = "Seleccionar fecha"
}: DatePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [currentMonth, setCurrentMonth] = React.useState(date)

  const handleSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      onDateChange(selectedDate)
      setIsOpen(false)
    }
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

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full bg-slate-700 border-slate-600 text-white justify-between hover:bg-slate-600 hover:border-slate-500 transition-all duration-200",
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
                className="p-1 hover:bg-slate-600 rounded transition-colors"
                title="Hoy"
              >
                <span className="text-xs text-slate-400 hover:text-white">HOY</span>
              </button>
            )}
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className={cn(
          "w-auto p-0 bg-slate-800 border-slate-700 shadow-xl rounded-xl",
          className
        )}
        align="start"
        sideOffset={8}
      >
        <div className="flex items-center justify-between p-3 border-b border-slate-700">
          <button
            onClick={() => handleMonthChange('prev')}
            className="p-1.5 hover:bg-slate-700 rounded-lg transition-colors text-slate-300 hover:text-white"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-medium text-white">
            {format(currentMonth, "MMMM yyyy", { locale: es }).replace(/^\w/, c => c.toUpperCase())}
          </span>
          <button
            onClick={() => handleMonthChange('next')}
            className="p-1.5 hover:bg-slate-700 rounded-lg transition-colors text-slate-300 hover:text-white"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleSelect}
          month={currentMonth}
          onMonthChange={setCurrentMonth}
          className="bg-slate-800 text-white rounded-lg p-2"
          classNames={{
            months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
            month: "space-y-4",
            caption: "flex justify-center pt-1 relative items-center",
            caption_label: "text-sm font-medium",
            nav: "space-x-1 flex items-center",
            nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
            nav_button_previous: "absolute left-1",
            nav_button_next: "absolute right-1",
            table: "w-full border-collapse space-y-1",
            head_row: "flex",
            head_cell: "text-slate-400 rounded-md w-9 font-normal text-[0.8rem]",
            row: "flex w-full mt-2",
            cell: "h-9 w-9 text-center text-sm p-0 relative focus-within:relative focus-within:z-20",
            day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-slate-700 rounded-lg transition-colors text-slate-300 hover:text-white",
            day_selected: "bg-indigo-600 text-white hover:bg-indigo-600 hover:text-white focus:bg-indigo-600 focus:text-white rounded-lg",
            day_today: "bg-slate-700 text-white rounded-lg",
            day_outside: "text-slate-500 opacity-50",
            day_disabled: "text-slate-600 opacity-50",
            day_hidden: "invisible",
          }}
        />
        <div className="flex items-center justify-end gap-2 p-3 border-t border-slate-700">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
            className="text-slate-400 hover:text-white hover:bg-slate-700"
          >
            Cancelar
          </Button>
          <Button
            size="sm"
            onClick={() => {
              onDateChange(today)
              setIsOpen(false)
            }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            Hoy
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
