import { useMutation, useQuery } from "convex/react";
import { useMemo, useState } from "react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { CalendarGrid } from "./CalendarGrid";
import { CalendarHeader } from "./CalendarHeader";
import { MetadataDialog } from "../../components/MetadataDialog";

interface HabitCalendarProps {
  selectedHabits: Id<"habits">[];
}

type MetadataField = {
  name: string;
  type: "text" | "number" | "boolean" | "date" | "enum";
  options?: string[];
};

export function HabitCalendar({ selectedHabits }: HabitCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedCompletion, setSelectedCompletion] = useState<any>(null);

  const allHabits = useQuery(api.habits.getHabits, { includeSubHabits: true }) || [];

  const toggleCompletion = useMutation(api.completions.toggleCompletion);

  const handleSaveMetadata = async (metadata: Record<string, any>) => {
    if (!selectedCompletion) return;

    await toggleCompletion({
      date: selectedCompletion.date,
      habitId: selectedCompletion.habitId,
      completed: selectedCompletion.completed,
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
    }) || [];

  // Filter habits and sub-habits based on selection
  const displayHabits = useMemo(() => {
    const filteredHabits =
      selectedHabits.length > 0
        ? allHabits.filter(
            (h) => selectedHabits.includes(h._id) && h.parentId === undefined,
          )
        : allHabits.filter((h) => h.parentId === undefined);

    return filteredHabits.map((habit) => ({
      ...habit,
      subHabits: allHabits.filter(
        (sh) => sh.parentId === habit._id && sh.isActive,
      ),
    }));
  }, [selectedHabits, allHabits]);

  const getCompletionForDate = (date: string, habitId: Id<"habits">) => {
    return completions.find((c) => c.date === date && c.habitId === habitId);
  };

  const handleOpenDialog = (date: string, habitId: Id<"habits">) => {
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

    setSelectedCompletion({
      date,
      habitId,
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
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <CalendarHeader
        currentDate={currentDate}
        navigateMonth={navigateMonth}
        setCurrentDate={setCurrentDate}
      />
      <CalendarGrid
        dateRange={dateRange}
        displayHabits={displayHabits}
        getCompletionForDate={getCompletionForDate}
        handleOpenDialog={handleOpenDialog}
        toggleCompletion={toggleCompletion}
        isCurrentMonth={isCurrentMonth}
        isToday={isToday}
      />
      {selectedCompletion && (
        <MetadataDialog
          selectedCompletion={selectedCompletion}
          setSelectedCompletion={setSelectedCompletion}
          onSave={handleSaveMetadata}
        />
      )}
    </div>
  );
}
