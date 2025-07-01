import { useQuery } from "convex/react";
import { useState } from "react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { HeatmapCalendar } from "././HeatmapCalendar";
import { FilterPanel } from "./FilterPanel";
import { HabitCalendar } from "./HabitCalendar";
import { HabitForm } from "./HabitForm";
import { HabitList } from "./HabitList";
import { HabitsTable } from "./HabitsTable";

export function HabitTracker() {
  const [showForm, setShowForm] = useState(false);
  const [editingHabit, setEditingHabit] = useState<any>(null);
  const [selectedHabits, setSelectedHabits] = useState<Id<"habits">[]>([]);
  const [viewMode, setViewMode] = useState<
    "calendar" | "list" | "table" | "heatmap"
  >("calendar");

  const allHabits = useQuery(api.habits.getHabits) || [];

  const handleEditHabit = (habit: any) => {
    setEditingHabit(habit);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingHabit(null);
  };

  const getViewModeButton = (
    mode: "calendar" | "list" | "table" | "heatmap",
    label: string
  ) => (
    <button
      onClick={() => setViewMode(mode)}
      className={`px-4 py-2 rounded-lg transition-colors ${
        viewMode === mode
          ? "bg-blue-600 text-white"
          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-gray-900">My Habits</h1>
        <div className="flex gap-2 flex-wrap">
          {getViewModeButton("calendar", "Calendar")}
          {getViewModeButton("heatmap", "Heatmap")}
          {getViewModeButton("list", "List")}
          {getViewModeButton("table", "Table")}
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add Habit
          </button>
        </div>
      </div>

      {/* Filter Panel - show for calendar and heatmap views */}
      {(viewMode === "calendar" || viewMode === "heatmap") && (
        <FilterPanel
          allHabits={allHabits}
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
      {showForm && <HabitForm habit={editingHabit} onClose={handleCloseForm} />}
    </div>
  );
}
