import { Temporal } from "@js-temporal/polyfill";
import { useQuery } from "convex/react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { api } from "../../../convex/_generated/api";
import { Doc, Id } from "../../../convex/_generated/dataModel";

interface HabitListProps {
  date: Temporal.PlainDate;
  habits: (Doc<"habits"> & { subHabits?: Doc<"habits">[] })[];
  onClick: (
    habit: Doc<"habits">,
    completion: Doc<"completions"> | undefined,
  ) => void;
}

export function HabitList({ date, habits, onClick }: HabitListProps) {
  const completions =
    useQuery(api.completions.getCompletions, {
      startDate: date.toString(),
      endDate: date.toString(),
    }) || [];

  const getCompletionForDate = (date: string, habitId: Id<"habits">) => {
    return completions.find((c) => c.date === date && c.habitId === habitId);
  };

  return habits?.map((habit) => {
    const completion = getCompletionForDate(date.toString(), habit._id);

    return (
      <div key={`habit-${habit._id}`}>
        <Button
          key={habit._id}
          onClick={() => onClick(habit, completion)}
          className={cn(
            "w-full rounded p-1 text-left text-xs transition-colors bg-gray-100 text-gray-600 hover:bg-gray-200",
            {
              "bg-green-100 text-green-800": completion?.completed || false,
            },
          )}
          style={{ borderLeft: `3px solid ${habit.color}` }}
        >
          <span className="mr-1">{habit.icon}</span>
          {habit.name}
        </Button>
        {habit.subHabits && habit.subHabits.length > 0 && (
          <div className="ml-4 mt-1 space-y-1">
            <HabitList date={date} habits={habit.subHabits} onClick={onClick} />
          </div>
        )}
      </div>
    );
  });
}
