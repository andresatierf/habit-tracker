import { useQuery } from "convex/react";

import { api } from "../../../convex/_generated/api";

export function HabitsTable() {
  const allHabits =
    useQuery(api.habits.getHabits, { includeSubHabits: true }) || [];

  const topLevelHabits = allHabits.filter(
    (habit) => habit.parentId === undefined,
  );

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-200 px-6 py-4">
        <h2 className="text-xl font-semibold text-gray-900">Habits Table</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Icon
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Color
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Parent Habit
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {topLevelHabits.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  No habits found. Create your first habit to get started!
                </td>
              </tr>
            ) : (
              topLevelHabits.map((habit) => (
                <>
                  {/* Main Habit Row */}
                  <tr key={habit._id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-6 py-4">
                      <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                        Habit
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {habit.name}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span className="text-2xl">{habit.icon}</span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div
                          className="size-4 rounded-full border border-gray-300"
                          style={{ backgroundColor: habit.color }}
                        />
                        <span className="text-sm text-gray-600">
                          {habit.color}
                        </span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      -
                    </td>
                  </tr>

                  {/* Sub-habits Rows */}
                  {allHabits
                    .filter((sh) => sh.parentId === habit._id)
                    .map((subHabit) => (
                      <tr
                        key={subHabit._id}
                        className="bg-gray-50 hover:bg-gray-100"
                      >
                        <td className="whitespace-nowrap px-6 py-4">
                          <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                            Sub-habit
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="pl-4 text-sm text-gray-900">
                            {subHabit.name}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <span className="text-xl">{subHabit.icon}</span>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div
                              className="size-4 rounded-full border border-gray-300"
                              style={{ backgroundColor: subHabit.color }}
                            />
                            <span className="text-sm text-gray-600">
                              {subHabit.color}
                            </span>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                          {habit.name}
                        </td>
                      </tr>
                    ))}
                </>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      {allHabits.length > 0 && (
        <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Total Habits: {topLevelHabits.length}</span>
            <span>
              Total Sub-habits:{" "}
              {allHabits.filter((h) => h.parentId !== undefined).length}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
