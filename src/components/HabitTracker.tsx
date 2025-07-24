import { useState } from "react";

import { ViewModes } from "@/shared/schema";
import { ViewMode } from "@/shared/types";
import { HabitCalendar } from "@/views/calendar/HabitCalendar";
import { DayView } from "@/views/day/DayView";
import { HeatmapCalendar } from "@/views/heatmap/HeatmapCalendar";
import { HabitList } from "@/views/list/HabitList";
import { HabitsTable } from "@/views/table/HabitsTable";

import type { Id } from "../../convex/_generated/dataModel";

import { FilterPanel } from "./FilterPanel";
import { HabitForm } from "./habit-form";
import { Header } from "./Header";

export function HabitTracker() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Id<"habits">>();
  const [viewMode, setViewMode] = useState<ViewMode>(ViewModes.DAY);

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

      {(viewMode === ViewModes.MONTH || viewMode === ViewModes.HEATMAP) && (
        <FilterPanel />
      )}
      {viewMode === ViewModes.DAY && <DayView />}
      {viewMode === ViewModes.MONTH && <HabitCalendar />}
      {viewMode === ViewModes.HEATMAP && <HeatmapCalendar />}
      {viewMode === ViewModes.LIST && (
        <HabitList onEditHabit={handleEditHabit} />
      )}
      {viewMode === ViewModes.TABLE && <HabitsTable />}

      {/* Habit Form Modal */}
      <HabitForm
        isOpen={isFormOpen}
        habitId={editingHabit}
        onClose={handleCloseForm}
      />
    </div>
  );
}
