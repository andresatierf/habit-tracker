import { Id } from "../../convex/_generated/dataModel";

interface FilterPanelProps {
  allHabits: any[]; // Now includes both top-level and sub-habits
  selectedHabits: Id<"habits">[];
  onHabitsChange: (habits: Id<"habits">[]) => void;
}

export function FilterPanel({
  allHabits,
  selectedHabits,
  onHabitsChange,
}: FilterPanelProps) {
  const topLevelHabits = allHabits.filter(
    (habit) => habit.parentId === undefined
  );

  const handleHabitToggle = (habitId: Id<"habits">) => {
    if (selectedHabits.includes(habitId)) {
      onHabitsChange(selectedHabits.filter((id) => id !== habitId));
    } else {
      onHabitsChange([...selectedHabits, habitId]);
    }
  };

  const clearAllFilters = () => {
    onHabitsChange([]);
  };

  const selectAllHabits = () => {
    onHabitsChange(allHabits.map((h) => h._id));
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
            Select All
          </button>
          <button
            onClick={clearAllFilters}
            className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
          >
            Clear All
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {/* Habits Filter */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Habits</h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {topLevelHabits.map((habit) => (
              <div key={habit._id}>
                <label className="flex items-center gap-2 cursor-pointer">
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
                {allHabits.filter((sh) => sh.parentId === habit._id).length >
                  0 && (
                  <div className="ml-6 mt-1 space-y-1">
                    {allHabits
                      .filter((sh) => sh.parentId === habit._id)
                      .map((subHabit) => (
                        <label
                          key={subHabit._id}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={selectedHabits.includes(subHabit._id)}
                            onChange={() => handleHabitToggle(subHabit._id)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: subHabit.color }}
                          />
                          <span className="text-lg">{subHabit.icon}</span>
                          <span className="text-sm text-gray-700">
                            {subHabit.name}
                          </span>
                        </label>
                      ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Active Filters Summary */}
      {selectedHabits.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Showing {selectedHabits.length} selected habits
          </p>
        </div>
      )}
    </div>
  );
}
