import { useCallback, useMemo } from "react";

import { Temporal } from "@js-temporal/polyfill";
import { useMutation, useQuery } from "convex/react";

import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

import { api } from "../../../convex/_generated/api";
import type { Doc, Id } from "../../../convex/_generated/dataModel";

import { HabitList } from "./HabitList";

interface DayCellProps {
  date: Temporal.PlainDate;
  onOpen: (date: string, habitId: Id<"habits">) => void;
}

export function DayCell({ date, onOpen }: DayCellProps) {
  const filteredHabits = useStore((store) => store.filters.habits);
  const currentDate = useStore((store) => store.date);
  const isCurrentMonth = date.month === currentDate.month;

  const allHabits =
    useQuery(api.habits.getHabits, { includeSubHabits: true }) || [];

  const toggleCompletion = useMutation(api.completions.toggleCompletion);

  const handleOnClick = useCallback(
    async (
      habit: Doc<"habits">,
      completion: Doc<"completions"> | undefined,
    ) => {
      if (completion?.completed || false) {
        await toggleCompletion({
          date: date.toString(),
          habitId: habit._id,
          completed: false,
          metadata: completion?.metadata,
        });
        return;
      }

      if (habit.metadata && habit.metadata.length > 0) {
        onOpen(date.toString(), habit._id);
      } else {
        await toggleCompletion({
          date: date.toString(),
          habitId: habit._id,
          completed: true,
        });
      }
    },
    [date, onOpen, toggleCompletion],
  );

  const displayHabits = useMemo(() => {
    return allHabits
      .filter(
        (h) =>
          (!filteredHabits.length || filteredHabits.includes(h._id)) &&
          h.parentId === undefined,
      )
      .map((habit) => ({
        ...habit,
        subHabits: allHabits.filter(
          (sh) => sh.parentId === habit._id && sh.isActive,
        ),
      }));
  }, [allHabits, filteredHabits]);

  return (
    <div
      key={date.toString()}
      className={cn("min-h-[120px] border border-gray-100 p-1 bg-white", {
        "bg-gray-50": !isCurrentMonth,
        "ring-2 ring-blue-500":
          date.toString() === Temporal.Now.plainDateISO().toString(),
      })}
    >
      <div
        className={cn("mb-1 text-sm font-medium text-gray-900", {
          "text-gray-400": !isCurrentMonth,
        })}
      >
        {date.day}
      </div>
      <div className="space-y-1">
        <HabitList date={date} habits={displayHabits} onClick={handleOnClick} />
      </div>
    </div>
  );
}
