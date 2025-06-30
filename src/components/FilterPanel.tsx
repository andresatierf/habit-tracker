import { Id } from "../../convex/_generated/dataModel";

interface FilterPanelProps {
  habits: any[];
  subHabits: any[];
  selectedHabits: Id<"habits">[];
  selectedSubHabits: Id<"subHabits">[];
  onHabitsChange: (habits: Id<"habits">[]) => void;
  onSubHabitsChange: (subHabits: Id<"subHabits">[]) => void;
}

export function FilterPanel({
  habits,
  subHabits,
  selectedHabits,
  selectedSubHabits,
  onHabitsChange,
  onSubHabitsChange,
}: FilterPanelProps) {
  const handleHabitToggle = (habitId: Id<"habits">) => {
    if (selectedHabits.includes(habitId)) {
      onHabitsChange(selectedHabits.filter(id => id !== habitId));
    } else {
      onHabitsChange([...selectedHabits, habitId]);
    }
  };

  const handleSubHabitToggle = (subHabitId: Id<"subHabits">) => {
    if (selectedSubHabits.includes(subHabitId)) {
      onSubHabitsChange(selectedSubHabits.filter(id => id !== subHabitId));
    } else {
      onSubHabitsChange([...selectedSubHabits, subHabitId]);
    }
  };

  const clearAllFilters = () => {
    onHabitsChange([]);
    onSubHabitsChange([]);
  };

  const selectAllHabits = () => {
    onHabitsChange(habits.map(h => h._id));
  };

  const selectAllSubHabits = () => {
    onSubHabitsChange(subHabits.map(sh => sh._id));
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        <div className="flex gap-2">
          <button
            onClick={selectAllHabits}
            className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
          >
            All Habits
          </button>
          <button
            onClick={selectAllSubHabits}
            className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
          >
            All Sub-habits
          </button>
          <button
            onClick={clearAllFilters}
            className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
          >
            Clear All
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Habits Filter */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Habits</h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {habits.map(habit => (
              <label key={habit._id} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedHabits.includes(habit._id)}
                  onChange={() => handleHabitToggle(habit._id)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: habit.color }}
                />
                <span className="text-lg">{habit.icon}</span>
                <span className="text-sm text-gray-700">{habit.name}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Sub-habits Filter */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Sub-habits</h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {subHabits.map(subHabit => {
              const parentHabit = habits.find(h => h._id === subHabit.habitId);
              return (
                <label key={subHabit._id} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedSubHabits.includes(subHabit._id)}
                    onChange={() => handleSubHabitToggle(subHabit._id)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: subHabit.color }}
                  />
                  <span className="text-lg">{subHabit.icon}</span>
                  <span className="text-sm text-gray-700">
                    {subHabit.name}
                    {parentHabit && (
                      <span className="text-gray-500 ml-1">({parentHabit.name})</span>
                    )}
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      </div>

      {/* Active Filters Summary */}
      {(selectedHabits.length > 0 || selectedSubHabits.length > 0) && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Showing {selectedHabits.length} habits and {selectedSubHabits.length} sub-habits
          </p>
        </div>
      )}
    </div>
  );
}
