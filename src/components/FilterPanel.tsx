import { useQuery } from "convex/react";

import { Button } from "@/components/ui/button";
import { useStore } from "@/shared/store";

import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

export function FilterPanel() {
  const allHabits =
    useQuery(api.habits.getHabits, { includeSubHabits: true }) || [];
  const filteredHabits = useStore((state) => state.filters.habits);
  const setFilteredHabits = useStore((state) => state.filters.setHabits);

  const topLevelHabits = allHabits.filter(
    (habit) => habit.parentId === undefined,
  );

  const handleHabitToggle = (habitId: Id<"habits">) => {
    if (filteredHabits.includes(habitId)) {
      setFilteredHabits(filteredHabits.filter((id) => id !== habitId));
    } else {
      setFilteredHabits([...filteredHabits, habitId]);
    }
  };

  const clearAllFilters = () => {
    setFilteredHabits([]);
  };

  const selectAllHabits = () => {
    setFilteredHabits(allHabits.map((h) => h._id));
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        {filteredHabits.length > 0 && (
          <div className="ml-4 border-l border-gray-200 pl-4">
            <p className="text-sm text-gray-600">
              Showing {filteredHabits.length} selected habits
            </p>
          </div>
        )}
        <div className="flex grow justify-end gap-2">
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
                    checked={filteredHabits.includes(habit._id)}
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
                            checked={filteredHabits.includes(subHabit._id)}
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
    </div>
  );
}
