"use client";

import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export interface CalendarProps {
  className?: string
  mode?: "single"
  selected?: Date
  onSelect?: (date: Date | undefined) => void
  fromYear?: number
  toYear?: number
}

export function Calendar({
  className,
  mode,
  selected,
  onSelect,
  fromYear = 1900,
  toYear = 2100,
}: CalendarProps) {
  const [viewDate, setViewDate] = React.useState<Date>(selected || new Date())
  const [view, setView] = React.useState<"days" | "months" | "years">("days")

  const currentYear = viewDate.getFullYear()
  const currentMonth = viewDate.getMonth()

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay()

  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ]

  const dayNames = ["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sá"]

  const years = Array.from({ length: 101 }, (_, i) => currentYear - 50 + i)
  const months = monthNames

  const handlePrev = () => {
    if (view === "days") {
      setViewDate(new Date(currentYear, currentMonth - 1, 1))
    } else if (view === "months") {
      setViewDate(new Date(currentYear - 1, currentMonth, 1))
    } else {
      setViewDate(new Date(currentYear - 10, currentMonth, 1))
    }
  }

  const handleNext = () => {
    if (view === "days") {
      setViewDate(new Date(currentYear, currentMonth + 1, 1))
    } else if (view === "months") {
      setViewDate(new Date(currentYear + 1, currentMonth, 1))
    } else {
      setViewDate(new Date(currentYear + 10, currentMonth, 1))
    }
  }

  const handleDateClick = (day: number) => {
    const newDate = new Date(currentYear, currentMonth, day)
    if (onSelect) onSelect(newDate)
  }

  const isSelected = (day: number) => {
    if (!selected) return false
    return (
      selected.getDate() === day &&
      selected.getMonth() === currentMonth &&
      selected.getFullYear() === currentYear
    )
  }

  const isToday = (day: number) => {
    const today = new Date()
    return (
      today.getDate() === day &&
      today.getMonth() === currentMonth &&
      today.getFullYear() === currentYear
    )
  }

  const handleViewChange = () => {
    if (view === "days") setView("months")
    else if (view === "months") setView("years")
    else setView("days")
  }

  const handleYearSelect = (year: number) => {
    setViewDate(new Date(year, currentMonth, 1))
    setView("days")
  }

  const handleMonthSelect = (month: number) => {
    setViewDate(new Date(currentYear, month, 1))
    setView("days")
  }

  const renderDays = () => {
    const days = []
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="h-9 w-9" />)
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const selectedClass = isSelected(day)
        ? "bg-green-500 text-black font-bold"
        : "hover:bg-zinc-700"
      const todayClass = isToday(day) && !isSelected(day)
        ? "border border-green-500 text-green-500"
        : ""

      days.push(
        <button
          key={day}
          onClick={() => handleDateClick(day)}
          className={cn(
            "h-9 w-9 rounded-md text-sm transition-colors",
            selectedClass,
            todayClass,
            "text-white"
          )}
        >
          {day}
        </button>
      )
    }
    return days
  }

  const renderMonths = () => {
    return months.map((month, index) => (
      <button
        key={month}
        onClick={() => handleMonthSelect(index)}
        className={cn(
          "h-12 w-full rounded-md text-sm transition-colors hover:bg-zinc-700",
          selected && selected.getMonth() === index && selected.getFullYear() === currentYear
            ? "bg-green-500 text-black font-bold"
            : "text-white"
        )}
      >
        {month}
      </button>
    ))
  }

  const renderYears = () => {
    return years.map((year) => (
      <button
        key={year}
        onClick={() => handleYearSelect(year)}
        className={cn(
          "h-9 w-full rounded-md text-sm transition-colors hover:bg-zinc-700",
          selected && selected.getFullYear() === year
            ? "bg-green-500 text-black font-bold"
            : "text-white"
        )}
      >
        {year}
      </button>
    ))
  }

  return (
    <div className={cn("p-3 rounded-lg bg-zinc-900 border border-zinc-700", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={handlePrev}
          className="h-8 w-8 rounded-md hover:bg-zinc-700 flex items-center justify-center text-white"
        >
          ←
        </button>
        <button
          onClick={handleViewChange}
          className="text-lg font-semibold text-white"
        >
          {view === "days" && `${monthNames[currentMonth]} ${currentYear}`}
          {view === "months" && `${currentYear}`}
          {view === "years" && `${currentYear - 10} - ${currentYear + 90}`}
        </button>
        <button
          onClick={handleNext}
          className="h-8 w-8 rounded-md hover:bg-zinc-700 flex items-center justify-center text-white"
        >
          →
        </button>
      </div>

      {/* Day names */}
      {view === "days" && (
        <div className="grid grid-cols-7 mb-2">
          {dayNames.map((day) => (
            <div
              key={day}
              className="h-8 w-9 flex items-center justify-center text-xs text-zinc-400"
            >
              {day}
            </div>
          ))}
        </div>
      )}

      {/* Days grid */}
      {view === "days" && (
        <div className="grid grid-cols-7 gap-1">
          {renderDays()}
        </div>
      )}

      {/* Months grid */}
      {view === "months" && (
        <div className="grid grid-cols-3 gap-1">
          {renderMonths()}
        </div>
      )}

      {/* Years grid */}
      {view === "years" && (
        <div className="grid grid-cols-3 gap-1 max-h-64 overflow-y-auto">
          {renderYears()}
        </div>
      )}
    </div>
  )
}