import { useMutation, useQuery } from "convex/react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

interface HabitCardProps {
  habit: any;
  isExpanded: boolean;
  onToggleExpanded: (habitId: Id<"habits">) => void;
  onAdd: (habitId: Id<"habits">) => void;
  onEdit: (habitId: Id<"habits">) => void;
  isSubHabit?: boolean; // New prop
}

export function HabitCard({
  habit,
  isExpanded,
  onToggleExpanded,
  onAdd,
  onEdit,
  isSubHabit = false, // Default to false
}: HabitCardProps) {
  const subHabits =
    useQuery(api.habits.getSubHabits, { parentId: habit._id }) || [];
  const deleteHabit = useMutation(api.habits.deleteHabit);

  const cardClasses = cn(
    "rounded-lg border border-gray-200 bg-white shadow-sm",
    {
      "bg-gray-50 border-none shadow-none": isSubHabit,
    },
  );

  const onDelete = async (habitId) => {
    if (
      confirm(
        "Are you sure you want to delete this habit? This will also delete all sub-habits.",
      )
    ) {
      await deleteHabit({ habitId });
    }
  };

  return (
    <div className={cardClasses}>
      <div className={cn("p-4", { "p-2": isSubHabit })}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={cn("size-4 rounded-full", {
                "size-3": isSubHabit,
              })}
              style={{ backgroundColor: habit.color }}
            />
            <span
              className={cn("text-2xl", {
                "text-lg": isSubHabit,
              })}
            >
              {habit.icon}
            </span>
            <h3
              className={cn("text-lg font-semibold text-gray-900", {
                "text-gray-700": isSubHabit,
              })}
            >
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
              onClick={() => onAdd(habit._id)}
              variant="outline"
              size="sm"
              className={cn("bg-green-100 text-green-700 hover:bg-green-200", {
                "px-2 py-1 text-xs transition-colors": isSubHabit,
              })}
            >
              Add Sub-habit
            </Button>
            <Button
              onClick={() => onEdit(habit._id)}
              variant="outline"
              size="sm"
              className={cn("bg-blue-100 text-blue-700 hover:bg-blue-200", {
                "px-2 py-1 text-xs transition-colors": isSubHabit,
              })}
            >
              Edit
            </Button>
            <Button
              onClick={() => onDelete(habit._id)}
              variant="outline"
              size="sm"
              className={cn("bg-red-100 text-red-700 hover:bg-red-200", {
                "px-2 py-1 text-xs transition-colors": isSubHabit,
              })}
            >
              Delete
            </Button>
            {subHabits.length > 0 && (
              <Button
                onClick={() => onToggleExpanded(habit._id)}
                variant="outline"
                size="sm"
                className={cn("bg-gray-100 text-gray-700 hover:bg-gray-200", {
                  "px-2 py-1 text-xs transition-colors": isSubHabit,
                })}
              >
                {isExpanded ? "Collapse" : "Expand"}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Sub-habits */}
      {isExpanded && subHabits.length > 0 && (
        <div className="mt-2 space-y-2 pb-2 pl-8 pr-2">
          {subHabits.map((subHabit) => (
            <HabitCard
              key={subHabit._id}
              habit={subHabit}
              onToggleExpanded={onToggleExpanded}
              onAdd={onAdd}
              onEdit={onEdit}
              onDelete={onDelete}
              isExpanded={isExpanded}
              isSubHabit={true}
            />
          ))}
        </div>
      )}
    </div>
  );
}
