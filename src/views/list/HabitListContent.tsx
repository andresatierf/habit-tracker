import React from "react";
import type { Id } from "../../../convex/_generated/dataModel";
import { HabitCard } from "./HabitCard";
import { NoHabitsMessage } from "./NoHabitsMessage";

interface HabitListContentProps {
  allHabits: any[];
  expandedHabits: Set<Id<"habits">>;
  toggleExpanded: (habitId: Id<"habits">) => void;
  onEditHabit: (habit: any) => void;
  handleDeleteHabit: (habitId: Id<"habits">) => void;
  handleAddSubHabit: (parentId: Id<"habits">) => void;
  handleEditSubHabit: (subHabit: any) => void;
  handleDeleteSubHabit: (subHabitId: Id<"habits">) => void;
}

export function HabitListContent({
  allHabits,
  expandedHabits,
  toggleExpanded,
  onEditHabit,
  handleDeleteHabit,
  handleAddSubHabit,
  handleEditSubHabit,
  handleDeleteSubHabit,
}: HabitListContentProps) {
  return (
    <div className="space-y-4">
      {allHabits.length === 0 ? (
        <NoHabitsMessage />
      ) : (
        allHabits.map((habit) => (
          <HabitCard
            key={habit._id}
            habit={habit}
            isExpanded={expandedHabits.has(habit._id)}
            onToggleExpanded={() => toggleExpanded(habit._id)}
            onEdit={() => onEditHabit(habit)}
            onDelete={() => handleDeleteHabit(habit._id)}
            onAddSubHabit={() => handleAddSubHabit(habit._id)}
            onEditSubHabit={handleEditSubHabit}
            onDeleteSubHabit={handleDeleteSubHabit}
          />
        ))
      )}
    </div>
  );
}
