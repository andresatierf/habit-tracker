import { useState } from "react";

import { HabitCalendar } from "@/views/calendar/HabitCalendar";
import { HeatmapCalendar } from "@/views/heatmap/HeatmapCalendar";
import { HabitList } from "@/views/list/HabitList";
import { HabitsTable } from "@/views/table/HabitsTable";

import type { Id } from "../../convex/_generated/dataModel";

import { FilterPanel } from "./FilterPanel";
import { HabitForm } from "./HabitForm";
import { Header } from "./Header";

export function HabitTracker() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Id<"habits">>();
  const [viewMode, setViewMode] = useState<
    "calendar" | "list" | "table" | "heatmap"
  >("calendar");

  const handleAddHabit = () => {
    setEditingHabit(undefined);
    setIsFormOpen(true);
  };

  const handleEditHabit = (habitId: Id<"habits">) => {
    setEditingHabit(habitId);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingHabit(undefined);
  };

  return (
    <div className="space-y-6">
      <Header
        viewMode={viewMode}
        setViewMode={setViewMode}
        onAddHabit={handleAddHabit}
      />

      {(viewMode === "calendar" || viewMode === "heatmap") && <FilterPanel />}
      {viewMode === "calendar" && <HabitCalendar />}
      {viewMode === "heatmap" && <HeatmapCalendar />}
      {viewMode === "list" && <HabitList onEditHabit={handleEditHabit} />}
      {viewMode === "table" && <HabitsTable />}

      {/* Habit Form Modal */}
      <HabitForm
        isOpen={isFormOpen}
        habitId={editingHabit}
        onClose={handleCloseForm}
      />
    </div>
  );
}
