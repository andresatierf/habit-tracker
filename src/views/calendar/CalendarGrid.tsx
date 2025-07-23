import { useMemo } from "react";

import { useQuery } from "convex/react";

import { useStore } from "@/lib/store";
import { generateDateRange } from "@/lib/utils";

import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

import { DayCell } from "./DayCell";

const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

type MetadataField = {
  name: string;
  type: "text" | "number" | "boolean" | "date" | "enum";
  options?: string[];
};

export function CalendarGrid() {
  const currentDate = useStore((state) => state.date);
  const selectedHabits = useStore((state) => state.filters.habits);
  const setCompletionMetadata = useStore(
    (store) => store.setCompletionMetadata,
  );

  const allHabits =
    useQuery(api.habits.getHabits, { includeSubHabits: true }) || [];

  const dateRange = useMemo(() => {
    return generateDateRange({
      first: currentDate.with({ day: 1 }),
      last: currentDate
        .with({ day: 1 })
        .add({ months: 1 })
        .subtract({ days: 1 }),
      withWeekPadding: true,
    });
  }, [currentDate]);

  const completions =
    useQuery(api.completions.getCompletions, {
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
      habitIds: selectedHabits.length > 0 ? selectedHabits : undefined,
    }) || [];

  const getCompletionForDate = (date: string, habitId: Id<"habits">) => {
    return completions.find((c) => c.date === date && c.habitId === habitId);
  };

  const onOpen = (date: string, habitId: Id<"habits">) => {
    const completion = getCompletionForDate(date, habitId);
    const habit = allHabits.find((h) => h._id === habitId);

    let initialMetadataSchema: MetadataField[] = [];
    let initialMetadataValues: Record<string, any> = {};

    if (habit?.metadata) {
      initialMetadataSchema = habit.metadata;
    }

    if (completion?.metadata) {
      initialMetadataValues = completion.metadata;
    } else {
      // Initialize with default values based on schema types
      initialMetadataSchema.forEach((field) => {
        if (field.type === "number") initialMetadataValues[field.name] = 0;
        else if (field.type === "boolean")
          initialMetadataValues[field.name] = false;
        else initialMetadataValues[field.name] = "";
      });
    }

    setCompletionMetadata({
      date,
      habitId,
      completed: completion?.completed || true,
      metadataSchema: initialMetadataSchema,
      existingMetadata: initialMetadataValues,
    });
  };

  return (
    <div className="grid grid-cols-7 gap-1">
      {weekDays.map((day) => (
        <div
          key={day}
          className="p-2 text-center text-sm font-medium text-gray-500"
        >
          {day}
        </div>
      ))}
      {dateRange.dates.map((date) => {
        return <DayCell key={date.toString()} date={date} onOpen={onOpen} />;
      })}
    </div>
  );
}
