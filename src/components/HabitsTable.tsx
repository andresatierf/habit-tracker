import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export function HabitsTable() {
  const allHabits = useQuery(api.habits.getHabits) || [];

  const topLevelHabits = allHabits.filter(habit => habit.parentId === undefined);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">Habits Table</h2>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Icon
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Color
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Parent Habit
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
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
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Habit
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{habit.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-2xl">{habit.icon}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-full border border-gray-300"
                          style={{ backgroundColor: habit.color }}
                        />
                        <span className="text-sm text-gray-600">{habit.color}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      -
                    </td>
                  </tr>
                  
                  {/* Sub-habits Rows */}
                  {allHabits.filter(sh => sh.parentId === habit._id).map((subHabit: any) => (
                    <tr key={subHabit._id} className="hover:bg-gray-50 bg-gray-25">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Sub-habit
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 pl-4">{subHabit.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-xl">{subHabit.icon}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-4 h-4 rounded-full border border-gray-300"
                            style={{ backgroundColor: subHabit.color }}
                          />
                          <span className="text-sm text-gray-600">{subHabit.color}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
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
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Total Habits: {topLevelHabits.length}</span>
            <span>Total Sub-habits: {allHabits.filter(h => h.parentId !== undefined).length}</span>
          </div>
        </div>
      )}
    </div>
  );
}
