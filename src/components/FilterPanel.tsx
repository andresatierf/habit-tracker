import { useQuery } from "convex/react";
import { Button } from "@/components/button";
import type { Id } from "../../convex/_generated/dataModel";
import { api } from "../../convex/_generated/api";

interface FilterPanelProps {
  selectedHabits: Id<"habits">[];
  onHabitsChange: (habits: Id<"habits">[]) => void;
}

export function FilterPanel({
  selectedHabits,
  onHabitsChange,
}: FilterPanelProps) {
  const allHabits =
    useQuery(api.habits.getHabits, { includeSubHabits: true }) || [];

  const topLevelHabits = allHabits.filter(
    (habit) => habit.parentId === undefined,
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
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        <div className="flex gap-2">
          <Button
            onClick={selectAllHabits}
            variant="filterPrimary"
            size="filter"
          >
            Select All
          </Button>
          <Button
            onClick={clearAllFilters}
            variant="filterSecondary"
            size="filter"
          >
            Clear All
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {/* Habits Filter */}
        <div>
          <h4 className="mb-2 text-sm font-medium text-gray-700">Habits</h4>
          <div className="max-h-40 space-y-2 overflow-y-auto">
            {topLevelHabits.map((habit) => (
              <div key={habit._id}>
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedHabits.includes(habit._id)}
                    onChange={() => handleHabitToggle(habit._id)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div
                    className="size-3 rounded-full"
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
                          className="flex cursor-pointer items-center gap-2"
                        >
                          <input
                            type="checkbox"
                            checked={selectedHabits.includes(subHabit._id)}
                            onChange={() => handleHabitToggle(subHabit._id)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <div
                            className="size-3 rounded-full"
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
        <div className="mt-4 border-t border-gray-200 pt-4">
          <p className="text-sm text-gray-600">
            Showing {selectedHabits.length} selected habits
          </p>
        </div>
      )}
    </div>
  );
}
