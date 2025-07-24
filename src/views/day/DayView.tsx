import { useQuery } from "convex/react";

import { MetadataDialog } from "@/components/MetadataDialog";
import { useStore } from "@/shared/store";

import { api } from "../../../convex/_generated/api";

import { DayHeader } from "./DayHeader";
import { HabitCard } from "./HabitCard";

export function DayView() {
  const selectedDate = useStore((state) => state.calendar.date);

  const habits = useQuery(api.habits.getHabitsByDate, {
    date: selectedDate.toString(),
  });

  const completions = useQuery(api.completions.getCompletionsForDate, {
    date: selectedDate.toString(),
  });

  if (!habits) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-4">
      <MetadataDialog />
      <DayHeader />
      <div className="mt-4 flex flex-wrap gap-4">
        {habits.map((habit) => (
          <HabitCard
            key={habit._id}
            habit={habit}
            completion={completions?.find((c) => c.habitId === habit._id)}
            date={selectedDate.toString()}
            className="flex-[40%]"
          />
        ))}
      </div>
    </div>
  );
}
