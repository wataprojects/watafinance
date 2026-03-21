"use client";

import * as React from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Calendar as CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

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
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(date)

  React.useEffect(() => {
    // Only update if the date prop actually changed and is valid
    if (date !== undefined && date !== null) {
      setSelectedDate(date)
    } else if (date === undefined || date === null) {
      setSelectedDate(undefined)
    }
  }, [date])

  const handleDateSelect = (selected: Date | undefined) => {
    setSelectedDate(selected)
    if (onDateChange) {
      onDateChange(selected)
    }
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
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
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 bg-slate-800 border-slate-700" align="start">
        <div className="p-3 border-b border-slate-700">
          <input
            type="date"
            className="w-full bg-slate-700 border-slate-600 text-white rounded-md px-3 py-2"
            value={selectedDate ? format(selectedDate, "yyyy-MM-dd") : ""}
            onChange={(e) => {
              const value = e.target.value
              if (value) {
                const [year, month, day] = value.split("-").map(Number)
                const newDate = new Date(year, month - 1, day)
                handleDateSelect(newDate)
              } else {
                handleDateSelect(undefined)
              }
            }}
          />
        </div>
      </PopoverContent>
    </Popover>
  )
}

DatePicker.displayName = "DatePicker"

export { DatePicker }