"use client"

import * as React from "react"
import { Calendar } from "lucide-react"
import { format, isValid } from "date-fns"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

const YEARS = Array.from(
  { length: 10 },
  (_, i) => new Date().getFullYear() - 5 + i
)

interface DatePickerProps {
  date?: Date | null
  onDateChange?: (date: Date) => void
  placeholder?: string
  className?: string
}

export function DatePicker({
  date,
  onDateChange,
  placeholder = "Select date",
  className,
}: DatePickerProps) {
  const [selectedDate, setSelectedDate] = React.useState<Date | null>(date || null)
  const [year, setYear] = React.useState<string>(
    selectedDate ? selectedDate.getFullYear().toString() : new Date().getFullYear().toString()
  )
  const [month, setMonth] = React.useState<string>(
    selectedDate ? (selectedDate.getMonth() + 1).toString() : (new Date().getMonth() + 1).toString()
  )

  // Update state when date prop changes
  React.useEffect(() => {
    if (date && isValid(date)) {
      setSelectedDate(date)
      setYear(date.getFullYear().toString())
      setMonth((date.getMonth() + 1).toString())
    } else {
      setSelectedDate(null)
    }
  }, [date])

  const handleYearChange = (year: string) => {
    setYear(year)
    const newDate = new Date(
      parseInt(year),
      parseInt(month) - 1,
      1
    )
    setSelectedDate(newDate)
    onDateChange?.(newDate)
  }

  const handleMonthChange = (month: string) => {
    setMonth(month)
    const newDate = new Date(
      parseInt(year),
      parseInt(month) - 1,
      1
    )
    setSelectedDate(newDate)
    onDateChange?.(newDate)
  }

  const displayDate = selectedDate && isValid(selectedDate) 
    ? format(selectedDate, "PPP") 
    : placeholder

  return (
    <div className={cn("flex gap-2", className)}>
      <Select value={month} onValueChange={handleMonthChange}>
        <SelectTrigger className="w-[110px] bg-slate-700 border-slate-600 text-white">
          <SelectValue placeholder="Month" />
        </SelectTrigger>
        <SelectContent className="bg-slate-800 border-slate-700">
          {MONTHS.map((m, i) => (
            <SelectItem
              key={m}
              value={(i + 1).toString()}
              className="text-white"
            >
              {m}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={year} onValueChange={handleYearChange}>
        <SelectTrigger className="w-[90px] bg-slate-700 border-slate-600 text-white">
          <SelectValue placeholder="Year" />
        </SelectTrigger>
        <SelectContent className="bg-slate-800 border-slate-700">
          {YEARS.map((y) => (
            <SelectItem
              key={y}
              value={y.toString()}
              className="text-white"
            >
              {y}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

export { DatePicker }