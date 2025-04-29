"use client"

import * as React from "react"
import Calendar from "react-calendar"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface CustomCalendarProps {
  value: Date
  onChange: (date: Date) => void
}

export function CustomCalendar({ value, onChange }: CustomCalendarProps) {
  return (
    <div className="p-3">
      <Calendar
      //@ts-expect-error error
        onChange={onChange}
        value={value}
        minDate={new Date()}
        className={cn(
          "w-full border rounded-lg shadow-sm bg-background",
          "react-calendar"
        )}
        navigationLabel={({ date }) =>
          date.toLocaleString('default', { month: 'long', year: 'numeric' })
        }
        nextLabel={<ChevronRight className="h-4 w-4" />}
        prevLabel={<ChevronLeft className="h-4 w-4" />}
        tileClassName={({ date, view }) =>
          cn(
            "rounded-md text-sm hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            date.getTime() === value.getTime() && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
            view === "month" && date.getDay() === 0 && "text-destructive"
          )
        }
      />

      <style jsx global>{`
        .react-calendar {
          border: 1px solid hsl(var(--border));
          font-family: var(--font-sans);
          background-color: hsl(var(--background));
        }

        .react-calendar__navigation {
          display: flex;
          align-items: center;
          margin-bottom: 1rem;
          padding: 0.5rem;
          background-color: hsl(var(--background));
          border-bottom: 1px solid hsl(var(--border));
        }

        .react-calendar__navigation__label {
          color: hsl(var(--foreground));
          font-weight: 500;
        }

        .react-calendar__navigation button {
          min-width: 44px;
          background: none;
          font-size: 14px;
          padding: 4px;
          border-radius: 6px;
          color: hsl(var(--foreground));
        }

        .react-calendar__navigation button:enabled:hover,
        .react-calendar__navigation button:enabled:focus {
          background-color: hsl(var(--accent));
          color: hsl(var(--accent-foreground));
        }

        .react-calendar__navigation button[disabled] {
          cursor: not-allowed;
          background-color: transparent;
        }

        .react-calendar__month-view {
          background-color: hsl(var(--background));
          padding: 0.5rem;
        }

        .react-calendar__month-view__weekdays {
          text-align: center;
          text-transform: uppercase;
          font-size: 12px;
          font-weight: 500;
          color: hsl(var(--muted-foreground));
          padding-bottom: 0.5rem;
          background-color: hsl(var(--background));
        }

        .react-calendar__month-view__weekdays abbr {
          text-decoration: none;
        }

        .react-calendar__month-view__days {
          background-color: hsl(var(--background));
        }

        .react-calendar__tile {
          padding: 10px 6px;
          background: none;
          text-align: center;
          line-height: 16px;
          font-size: 14px;
          border-radius: 6px;
          color: hsl(var(--foreground));
        }

        .react-calendar__tile:disabled {
          cursor: not-allowed;
          background-color: transparent;
          color: hsl(var(--foreground));
          opacity: 1;
        }

        .react-calendar__tile:enabled:hover,
        .react-calendar__tile:enabled:focus {
          background-color: hsl(var(--accent));
          color: hsl(var(--accent-foreground));
        }

        .react-calendar__tile--now {
          background-color: hsl(var(--muted));
          color: hsl(var(--muted-foreground));
        }

        .react-calendar__tile--active,
        .react-calendar__tile--active:enabled:hover,
        .react-calendar__tile--active:enabled:focus {
          background-color: hsl(var(--primary));
          color: hsl(var(--primary-foreground));
        }

        .react-calendar__month-view__days__day--weekend {
          color: hsl(var(--destructive));
        }

        .react-calendar__month-view__days__day--neighboringMonth {
          color: hsl(var(--muted-foreground));
        }

        /* Remove default white background from all views */
        .react-calendar__viewContainer,
        .react-calendar__year-view,
        .react-calendar__decade-view,
        .react-calendar__century-view {
          background-color: hsl(var(--background));
        }
      `}</style>
    </div>
  )
} 