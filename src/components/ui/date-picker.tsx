"use client"

import * as React from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Calendar as CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { DayPicker } from "react-day-picker"

export type DatePickerProps = React.ComponentProps<typeof DayPicker>

interface DatePickerComponentProps extends DatePickerProps {
  placeholder?: string
}

function DatePicker({
  className,
  classNames,
  showOutsideDays = true,
  placeholder,
  ...props
}: DatePickerComponentProps) {
  const [date, setDate] = React.useState<Date | undefined>(props.date)

  React.useEffect(() => {
    setDate(props.date)
  }, [props.date])

  const handleSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate)
    props.onDateChange?.(selectedDate)
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700 hover:text-white",
            !date && "text-zinc-400"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? (
            format(date, "PPP", { locale: es })
          ) : (
            <span>{placeholder || "Seleccionar fecha"}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 bg-zinc-900 border-zinc-800" align="start">
        <DayPicker
          mode="single"
          selected={date}
          onSelect={handleSelect}
          className={className}
          classNames={{
            months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
            month: "space-y-4",
            caption: "flex justify-center pt-1 relative items-center",
            caption_label: "text-sm font-medium text-white",
            nav: "space-x-1 flex items-center",
            nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 text-white hover:bg-zinc-800 rounded",
            nav_button_previous: "absolute left-1",
            nav_button_next: "absolute right-1",
            table: "w-full border-collapse space-y-1",
            head_row: "flex",
            head_cell: "text-zinc-400 rounded-md w-9 font-normal text-[0.8rem]",
            row: "flex w-full mt-2",
            cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-zinc-800 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
            day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-zinc-800 rounded text-white",
            day_selected:
              "bg-green-500 text-black hover:bg-green-600 hover:text-black focus:bg-green-500 focus:text-black rounded",
            day_today: "bg-zinc-800 text-white",
            day_outside: "text-zinc-500 opacity-50",
            day_disabled: "text-zinc-600 opacity-50",
            day_range_middle:
              "aria-selected:bg-zinc-800 aria-selected:text-white rounded-none",
            day_hidden: "invisible",
            ...classNames,
          }}
          components={{
            Chevron: ({ orientation }) => {
              if (orientation === "left") {
                return (
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="24" 
                    height="24" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                    className="h-4 w-4"
                  >
                    <path d="m15 18-6-6 6-6" />
                  </svg>
                )
              }
              return (
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="24" 
                  height="24" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <path d="m9 18 6-6-6-6" />
                </svg>
              )
            }
          }}
          locale={es}
          {...props}
        />
      </PopoverContent>
    </Popover>
  )
}
DatePicker.displayName = "DatePicker"

export { DatePicker }