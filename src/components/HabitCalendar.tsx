import { useMutation, useQuery } from "convex/react";
import { useMemo, useState } from "react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { CalendarGrid } from "./CalendarGrid";
import { CalendarHeader } from "./CalendarHeader";
import { MetadataDialog } from "./MetadataDialog";

interface HabitCalendarProps {
  selectedHabits: Id<"habits">[];
  selectedSubHabits: Id<"subHabits">[];
}

type MetadataField = {
  name: string;
  type: "text" | "number" | "boolean" | "date";
};

export function HabitCalendar({
  selectedHabits,
  selectedSubHabits,
}: HabitCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedCompletion, setSelectedCompletion] = useState<any>(null);

  const habits = useQuery(api.habits.getHabits) || [];
  const subHabits = useQuery(api.habits.getAllSubHabits) || [];

  const toggleCompletion = useMutation(api.completions.toggleCompletion);

  const handleSaveMetadata = async (metadata: Record<string, any>) => {
    if (!selectedCompletion) return;

    await toggleCompletion({
      date: selectedCompletion.date,
      habitId: selectedCompletion.habitId,
      subHabitId: selectedCompletion.subHabitId,
      metadata: metadata,
    });
  };

  // Generate date range for the current month
  const dateRange = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay()); // Start from Sunday

    const endDate = new Date(lastDay);
    endDate.setDate(endDate.getDate() + (6 - lastDay.getDay())); // End on Saturday

    const dates = [];
    const current = new Date(startDate);
    while (current <= endDate) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    return {
      dates,
      startDate: startDate.toISOString().split("T")[0],
      endDate: endDate.toISOString().split("T")[0],
    };
  }, [currentDate]);

  const completions =
    useQuery(api.completions.getCompletions, {
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
      habitIds: selectedHabits.length > 0 ? selectedHabits : undefined,
      subHabitIds: selectedSubHabits.length > 0 ? selectedSubHabits : undefined,
    }) || [];

  // Filter habits and sub-habits based on selection
  const displayHabits =
    selectedHabits.length > 0
      ? habits.filter((h) => selectedHabits.includes(h._id))
      : habits;

  const displaySubHabits =
    selectedSubHabits.length > 0
      ? subHabits.filter((sh) => selectedSubHabits.includes(sh._id))
      : subHabits.filter(
          (sh) =>
            selectedHabits.length === 0 || selectedHabits.includes(sh.habitId),
        );

  const getCompletionForDate = (
    date: string,
    habitId?: Id<"habits">,
    subHabitId?: Id<"subHabits">,
  ) => {
    return completions.find(
      (c) =>
        c.date === date &&
        (habitId ? c.habitId === habitId : c.subHabitId === subHabitId),
    );
  };

  const handleOpenDialog = (
    date: string,
    habitId?: Id<"habits">,
    subHabitId?: Id<"subHabits">,
  ) => {
    const completion = getCompletionForDate(date, habitId, subHabitId);
    let initialMetadataSchema: MetadataField[] = [];
    let initialMetadataValues: Record<string, any> = {};

    if (habitId) {
      const habit = habits.find((h) => h._id === habitId);
      if (habit?.metadata) {
        initialMetadataSchema = habit.metadata;
      }
    } else if (subHabitId) {
      const subHabit = subHabits.find((sh) => sh._id === subHabitId);
      if (subHabit?.metadata) {
        initialMetadataSchema = subHabit.metadata;
      }
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

    setSelectedCompletion({
      date,
      habitId,
      subHabitId,
      completed: completion?.completed || false,
      metadataSchema: initialMetadataSchema,
      existingMetadata: initialMetadataValues,
    });
  };

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + (direction === "next" ? 1 : -1));
      return newDate;
    });
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <CalendarHeader
        currentDate={currentDate}
        navigateMonth={navigateMonth}
        setCurrentDate={setCurrentDate}
      />
      <CalendarGrid
        dateRange={dateRange}
        displayHabits={displayHabits}
        displaySubHabits={displaySubHabits}
        getCompletionForDate={getCompletionForDate}
        handleOpenDialog={handleOpenDialog}
        isCurrentMonth={isCurrentMonth}
        isToday={isToday}
      />
      <MetadataDialog
        selectedCompletion={selectedCompletion}
        setSelectedCompletion={setSelectedCompletion}
        onSave={handleSaveMetadata}
      />
    </div>
  );
}
