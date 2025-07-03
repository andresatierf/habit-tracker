import { useMemo, useState } from "react";

import { Temporal } from "@js-temporal/polyfill";
import { useMutation, useQuery } from "convex/react";

import { generateDateRange } from "@/lib/utils";

import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { MetadataDialog } from "../../components/MetadataDialog";

import { CalendarGrid } from "./CalendarGrid";
import { CalendarHeader } from "./CalendarHeader";


interface HabitCalendarProps {
  selectedHabits: Id<"habits">[];
}

type MetadataField = {
  name: string;
  type: "text" | "number" | "boolean" | "date" | "enum";
  options?: string[];
};

export function HabitCalendar({ selectedHabits }: HabitCalendarProps) {
  const [currentDate, setCurrentDate] = useState(Temporal.Now.plainDateISO());
  const [selectedCompletion, setSelectedCompletion] = useState<any>(null);

  const allHabits =
    useQuery(api.habits.getHabits, { includeSubHabits: true }) || [];

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
      const newDate = Temporal.PlainDate.from(prev).add(
        Temporal.Duration.from({ months: direction === "next" ? 1 : -1 }),
      );
      return newDate;
    });
  };

  const isCurrentMonth = (date: Temporal.PlainDate) => {
    return date.month === currentDate.month;
  };

  const isToday = (date: Temporal.PlainDate) => {
    const today = Temporal.Now.plainDateISO();
    return date.toString() === today.toString();
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
