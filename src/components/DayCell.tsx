import { Id } from "../../convex/_generated/dataModel";
import { HabitCompletionButton } from "./HabitCompletionButton";

interface DayCellProps {
  dateString: string;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  displayHabits: any[];
  getCompletionForDate: (
    date: string,
    habitId: Id<"habits">,
  ) => any;
  handleOpenDialog: (
    date: string,
    habitId: Id<"habits">,
  ) => void;
  toggleCompletion: (args: {
    date: string;
    habitId: Id<"habits">;
    completed?: boolean;
    metadata?: Record<string, any>;
  }) => Promise<void>;
}

export function DayCell({
  dateString,
  dayNumber,
  isCurrentMonth,
  isToday,
  displayHabits,
  getCompletionForDate,
  handleOpenDialog,
  toggleCompletion,
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
            <div key={`habit-${habit._id}`}>
              <HabitCompletionButton
                id={habit._id}
                name={habit.name}
                icon={habit.icon}
                color={habit.color}
                isCompleted={isCompleted}
                onClick={async (id) => {
                  if (isCompleted) {
                    await toggleCompletion({ date: dateString, habitId: id, completed: false, metadata: completion?.metadata });
                  } else {
                    handleOpenDialog(dateString, id);
                  }
                }}
              />
              {habit.subHabits && habit.subHabits.length > 0 && (
                <div className="ml-4 mt-1 space-y-1">
                  {habit.subHabits.map((subHabit: any) => {
                    const subCompletion = getCompletionForDate(dateString, subHabit._id);
                    const isSubCompleted = subCompletion?.completed || false;
                    return (
                      <HabitCompletionButton
                        key={`subhabit-${subHabit._id}`}
                        id={subHabit._id}
                        name={subHabit.name}
                        icon={subHabit.icon}
                        color={subHabit.color}
                        isCompleted={isSubCompleted}
                        onClick={async (id) => {
                          if (isSubCompleted) {
                            await toggleCompletion({ date: dateString, habitId: id, completed: false, metadata: subCompletion?.metadata });
                          } else {
                            handleOpenDialog(dateString, id);
                          }
                        }}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
