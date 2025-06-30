import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { HabitList } from "./HabitList";
import { HabitCalendar } from "./HabitCalendar";
import { HabitForm } from "./HabitForm";
import { FilterPanel } from "./FilterPanel";
import { HabitsTable } from "./HabitsTable";
import { HeatmapCalendar } from "./HeatmapCalendar";
import { Id } from "../../convex/_generated/dataModel";

export function HabitTracker() {
  const [showForm, setShowForm] = useState(false);
  const [editingHabit, setEditingHabit] = useState<any>(null);
  const [selectedHabits, setSelectedHabits] = useState<Id<"habits">[]>([]);
  const [selectedSubHabits, setSelectedSubHabits] = useState<Id<"subHabits">[]>([]);
  const [viewMode, setViewMode] = useState<"calendar" | "list" | "table" | "heatmap">("calendar");

  const habits = useQuery(api.habits.getHabits) || [];
  const subHabits = useQuery(api.habits.getAllSubHabits) || [];

  const handleEditHabit = (habit: any) => {
    setEditingHabit(habit);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingHabit(null);
  };

  const getViewModeButton = (mode: "calendar" | "list" | "table" | "heatmap", label: string) => (
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
          habits={habits}
          subHabits={subHabits}
          selectedHabits={selectedHabits}
          selectedSubHabits={selectedSubHabits}
          onHabitsChange={setSelectedHabits}
          onSubHabitsChange={setSelectedSubHabits}
        />
      )}

      {/* Main Content */}
      {viewMode === "calendar" && (
        <HabitCalendar
          selectedHabits={selectedHabits}
          selectedSubHabits={selectedSubHabits}
        />
      )}
      
      {viewMode === "heatmap" && (
        <HeatmapCalendar
          selectedHabits={selectedHabits}
          selectedSubHabits={selectedSubHabits}
        />
      )}
      
      {viewMode === "list" && (
        <HabitList
          habits={habits}
          onEditHabit={handleEditHabit}
        />
      )}
      
      {viewMode === "table" && <HabitsTable />}

      {/* Habit Form Modal */}
      {showForm && (
        <HabitForm
          habit={editingHabit}
          onClose={handleCloseForm}
        />
      )}
    </div>
  );
}
