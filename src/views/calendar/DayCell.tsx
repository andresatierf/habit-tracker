import { Temporal } from "@js-temporal/polyfill";
import type { Id } from "../../../convex/_generated/dataModel";
import { HabitCompletionButton } from "../../components/HabitCompletionButton";

interface DayCellProps {
  date: Temporal.PlainDate;
  isCurrentMonth: boolean;
  isToday: boolean;
  displayHabits: any[];
  getCompletionForDate: (date: string, habitId: Id<"habits">) => any;
  handleOpenDialog: (date: string, habitId: Id<"habits">) => void;
  toggleCompletion: (args: {
    date: string;
    habitId: Id<"habits">;
    completed?: boolean;
    metadata?: Record<string, any>;
  }) => Promise<null>;
}

export function DayCell({
  date,
  isCurrentMonth,
  isToday,
  displayHabits,
  getCompletionForDate,
  handleOpenDialog,
  toggleCompletion,
}: DayCellProps) {
  const dateString = date.toString();

  return (
    <div
      key={date.toString()}
      className={`min-h-[120px] border border-gray-100 p-1 ${
        !isCurrentMonth ? "bg-gray-50" : "bg-white"
      } ${isToday ? "ring-2 ring-blue-500" : ""}`}
    >
      <div
        className={`mb-1 text-sm font-medium ${
          !isCurrentMonth ? "text-gray-400" : "text-gray-900"
        }`}
      >
        {date.day}
      </div>

      <div className="space-y-1">
        {/* Habits */}
        {displayHabits.map((habit) => {
          const completion = getCompletionForDate(date.toString(), habit._id);
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
                    await toggleCompletion({
                      date: date.toString(),
                      habitId: id,
                      completed: false,
                      metadata: completion?.metadata,
                    });
                    return;
                  }

                  if (habit.metadata && habit.metadata.length > 0) {
                    handleOpenDialog(dateString, id);
                  } else {
                    await toggleCompletion({
                      date: dateString,
                      habitId: id,
                      completed: true,
                    });
                  }
                }}
              />
              {habit.subHabits && habit.subHabits.length > 0 && (
                <div className="ml-4 mt-1 space-y-1">
                  {habit.subHabits.map((subHabit: any) => {
                    const subCompletion = getCompletionForDate(
                      dateString,
                      subHabit._id,
                    );
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
                            await toggleCompletion({
                              date: dateString,
                              habitId: id,
                              completed: false,
                              metadata: subCompletion?.metadata,
                            });
                          } else {
                            if (
                              subHabit.metadata &&
                              subHabit.metadata.length > 0
                            ) {
                              handleOpenDialog(dateString, id);
                            } else {
                              await toggleCompletion({
                                date: dateString,
                                habitId: id,
                                completed: true,
                              });
                            }
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
