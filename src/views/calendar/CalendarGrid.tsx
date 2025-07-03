import { Temporal } from "@js-temporal/polyfill";

import type { Id } from "../../../convex/_generated/dataModel";

import { DayCell } from "./DayCell";

interface CalendarGridProps {
  dateRange: {
    dates: Temporal.PlainDate[];
    startDate: string;
    endDate: string;
  };
  displayHabits: any[];
  getCompletionForDate: (date: string, habitId: Id<"habits">) => any;
  handleOpenDialog: (date: string, habitId: Id<"habits">) => void;
  toggleCompletion: (args: {
    date: string;
    habitId: Id<"habits">;
    completed?: boolean;
    metadata?: Record<string, any>;
  }) => Promise<null>;
  isCurrentMonth: (date: Temporal.PlainDate) => boolean;
  isToday: (date: Temporal.PlainDate) => boolean;
}

export function CalendarGrid({
  dateRange,
  displayHabits,
  getCompletionForDate,
  handleOpenDialog,
  toggleCompletion,
  isCurrentMonth,
  isToday,
}: CalendarGridProps) {
  return (
    <div className="grid grid-cols-7 gap-1">
      {/* Day headers */}
      {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
        <div
          key={day}
          className="p-2 text-center text-sm font-medium text-gray-500"
        >
          {day}
        </div>
      ))}

      {/* Calendar days */}
      {dateRange.dates.map((date) => {
        return (
          <DayCell
            key={date.toString()}
            date={date}
            isCurrentMonth={isCurrentMonth(date)}
            isToday={isToday(date)}
            displayHabits={displayHabits}
            getCompletionForDate={getCompletionForDate}
            handleOpenDialog={handleOpenDialog}
            toggleCompletion={toggleCompletion}
          />
        );
      })}
    </div>
  );
}
