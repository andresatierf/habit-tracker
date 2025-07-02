import { useQuery } from "convex/react";
import { Button } from "@/components/button";
import type { Id } from "../../../convex/_generated/dataModel";
import { api } from "../../../convex/_generated/api";

interface HabitCardProps {
  habit: any;
  isExpanded: boolean;
  onToggleExpanded: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onAddSubHabit: () => void;
  onEditSubHabit: (subHabit: any) => void;
  onDeleteSubHabit: (subHabitId: Id<"habits">) => void;
}

export function HabitCard({
  habit,
  isExpanded,
  onToggleExpanded,
  onEdit,
  onDelete,
  onAddSubHabit,
  onEditSubHabit,
  onDeleteSubHabit,
}: HabitCardProps) {
  const subHabits =
    useQuery(api.habits.getSubHabits, { parentId: habit._id }) || [];

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="size-4 rounded-full"
              style={{ backgroundColor: habit.color }}
            />
            <span className="text-2xl">{habit.icon}</span>
            <h3 className="text-lg font-semibold text-gray-900">
              {habit.name}
            </h3>
            {subHabits.length > 0 && (
              <span className="text-sm text-gray-500">
                ({subHabits.length} sub-habits)
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={onAddSubHabit}
              variant="outline"
              size="sm"
              className="bg-green-100 text-green-700 hover:bg-green-200"
            >
              Add Sub-habit
            </Button>
            <Button
              onClick={onEdit}
              variant="outline"
              size="sm"
              className="bg-blue-100 text-blue-700 hover:bg-blue-200"
            >
              Edit
            </Button>
            <Button
              onClick={onDelete}
              variant="outline"
              size="sm"
              className="bg-red-100 text-red-700 hover:bg-red-200"
            >
              Delete
            </Button>
            {subHabits.length > 0 && (
              <Button
                onClick={onToggleExpanded}
                variant="outline"
                size="sm"
                className="bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                {isExpanded ? "Collapse" : "Expand"}
              </Button>
            )}
          </div>
        </div>

        {/* Sub-habits */}
        {isExpanded && subHabits.length > 0 && (
          <div className="mt-4 space-y-2 pl-8">
            {subHabits.map((subHabit) => (
              <div
                key={subHabit._id}
                className="flex items-center justify-between rounded bg-gray-50 p-2"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="size-3 rounded-full"
                    style={{ backgroundColor: subHabit.color }}
                  />
                  <span className="text-lg">{subHabit.icon}</span>
                  <span className="text-gray-700">{subHabit.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => onEditSubHabit(subHabit)}
                    variant="outline"
                    size="sm"
                    className="bg-blue-100 px-2 py-1 text-xs text-blue-700 transition-colors hover:bg-blue-200"
                  >
                    Edit
                  </Button>
                  <Button
                    onClick={() => onDeleteSubHabit(subHabit._id)}
                    variant="outline"
                    size="sm"
                    className="bg-red-100 px-2 py-1 text-xs text-red-700 transition-colors hover:bg-red-200"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
