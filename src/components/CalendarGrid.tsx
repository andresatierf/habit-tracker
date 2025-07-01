import { Id } from "../../convex/_generated/dataModel";
import { DayCell } from "./DayCell";

interface CalendarGridProps {
  dateRange: { dates: Date[]; startDate: string; endDate: string };
  displayHabits: any[];
  displaySubHabits: any[];
  getCompletionForDate: (date: string, habitId?: Id<"habits">, subHabitId?: Id<"subHabits">) => any;
  handleOpenDialog: (date: string, habitId?: Id<"habits">, subHabitId?: Id<"subHabits">) => void;
  isCurrentMonth: (date: Date) => boolean;
  isToday: (date: Date) => boolean;
}

export function CalendarGrid({
  dateRange,
  displayHabits,
  displaySubHabits,
  getCompletionForDate,
  handleOpenDialog,
  isCurrentMonth,
  isToday,
}: CalendarGridProps) {
  return (
    <div className="grid grid-cols-7 gap-1">
      {/* Day headers */}
      {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
        <div
          key={day}
          className="p-2 text-center text-sm font-medium text-gray-500"
        >
          {day}
        </div>
      ))}

      {/* Calendar days */}
      {dateRange.dates.map((date) => {
        const dateString = date.toISOString().split("T")[0];
        const dayNumber = date.getDate();

        return (
          <DayCell
            key={dateString}
            dateString={dateString}
            dayNumber={dayNumber}
            isCurrentMonth={isCurrentMonth(date)}
            isToday={isToday(date)}
            displayHabits={displayHabits}
            displaySubHabits={displaySubHabits}
            getCompletionForDate={getCompletionForDate}
            handleOpenDialog={handleOpenDialog}
          />
        );
      })}
    </div>
  );
}
