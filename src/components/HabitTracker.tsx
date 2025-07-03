import { useState } from "react";
import type { Id } from "../../convex/_generated/dataModel";
import { HabitList } from "../views/list/HabitList";
import { Button } from "./button";
import { HabitForm } from "./HabitForm";
import { FilterPanel } from "./FilterPanel";
import { HabitCalendar } from "@/views/calendar/HabitCalendar";
import { HeatmapCalendar } from "@/views/heatmap/HeatmapCalendar";
import { HabitsTable } from "@/views/table/HabitsTable";

export function HabitTracker() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Id<"habits">>();
  const [selectedHabits, setSelectedHabits] = useState<Id<"habits">[]>([]);
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

  const getViewModeButton = (
    mode: "calendar" | "list" | "table" | "heatmap",
    label: string,
  ) => (
    <Button
      variant={viewMode === mode ? "default" : "secondary"}
      onClick={() => setViewMode(mode)}
    >
      {label}
    </Button>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="text-3xl font-bold text-gray-900">My Habits</h1>
        <div className="flex flex-wrap gap-2">
          {getViewModeButton("calendar", "Calendar")}
          {getViewModeButton("heatmap", "Heatmap")}
          {getViewModeButton("list", "List")}
          {getViewModeButton("table", "Table")}
          <Button onClick={handleAddHabit}>Add Habit</Button>
        </div>
      </div>

      {/* Filter Panel - show for calendar and heatmap views */}
      {(viewMode === "calendar" || viewMode === "heatmap") && (
        <FilterPanel
          selectedHabits={selectedHabits}
          onHabitsChange={setSelectedHabits}
        />
      )}

      {/* Main Content */}
      {viewMode === "calendar" && (
        <HabitCalendar selectedHabits={selectedHabits} />
      )}

      {viewMode === "heatmap" && (
        <HeatmapCalendar selectedHabits={selectedHabits} />
      )}

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
