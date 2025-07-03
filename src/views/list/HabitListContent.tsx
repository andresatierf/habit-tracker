import React from "react";
import type { Id } from "../../../convex/_generated/dataModel";
import { HabitCard } from "./HabitCard";
import { NoHabitsMessage } from "./NoHabitsMessage";

interface HabitListContentProps {
  allHabits: any[];
  expandedHabits: Set<Id<"habits">>;
  toggleExpanded: (habitId: Id<"habits">) => void;
  onAdd: (parentId: Id<"habits">) => void;
  onEdit: (habitId: Id<"habits">) => void;
}

export function HabitListContent({
  allHabits,
  expandedHabits,
  toggleExpanded,
  onAdd,
  onEdit,
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
            onAdd={onAdd}
            onEdit={onEdit}
          />
        ))
      )}
    </div>
  );
}
