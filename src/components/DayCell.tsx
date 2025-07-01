import { Id } from "../../convex/_generated/dataModel";
import { HabitCompletionButton } from "./HabitCompletionButton";

interface DayCellProps {
  dateString: string;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  displayHabits: any[];
  displaySubHabits: any[];
  getCompletionForDate: (date: string, habitId?: Id<"habits">, subHabitId?: Id<"subHabits">) => any;
  handleOpenDialog: (date: string, habitId?: Id<"habits">, subHabitId?: Id<"subHabits">) => void;
}

export function DayCell({
  dateString,
  dayNumber,
  isCurrentMonth,
  isToday,
  displayHabits,
  displaySubHabits,
  getCompletionForDate,
  handleOpenDialog,
}: DayCellProps) {
  return (
    <div
      key={dateString}
      className={`min-h-[120px] p-1 border border-gray-100 ${
        !isCurrentMonth ? "bg-gray-50" : "bg-white"
      } ${isToday ? "ring-2 ring-blue-500" : ""}`}
    >
      <div
        className={`text-sm font-medium mb-1 ${
          !isCurrentMonth ? "text-gray-400" : "text-gray-900"
        }`}
      >
        {dayNumber}
      </div>

      <div className="space-y-1">
        {/* Habits */}
        {displayHabits.map((habit) => {
          const completion = getCompletionForDate(dateString, habit._id);
          const isCompleted = completion?.completed || false;

          return (
            <HabitCompletionButton
              key={`habit-${habit._id}`}
              id={habit._id}
              name={habit.name}
              icon={habit.icon}
              color={habit.color}
              isCompleted={isCompleted}
              onClick={(id) => handleOpenDialog(dateString, id)}
            />
          );
        })}

        {/* Sub-habits */}
        {displaySubHabits.map((subHabit) => {
          const completion = getCompletionForDate(
            dateString,
            undefined,
            subHabit._id
          );
          const isCompleted = completion?.completed || false;

          return (
            <HabitCompletionButton
              key={`subhabit-${subHabit._id}`}
              id={subHabit._id}
              name={subHabit.name}
              icon={subHabit.icon}
              color={subHabit.color}
              isCompleted={isCompleted}
              onClick={(id) => handleOpenDialog(dateString, undefined, id)}
            />
          );
        })}
      </div>
    </div>
  );
}
