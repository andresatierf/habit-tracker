import { useQuery } from "convex/react";

import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

import { HabitCard } from "./HabitCard";
import { NoHabitsMessage } from "./NoHabitsMessage";

interface HabitListContentProps {
  expandedHabits: Set<Id<"habits">>;
  toggleExpanded: (habitId: Id<"habits">) => void;
  onAdd: (parentId: Id<"habits">) => void;
  onEdit: (habitId: Id<"habits">) => void;
}

export function HabitListContent({
  expandedHabits,
  toggleExpanded,
  onAdd,
  onEdit,
}: HabitListContentProps) {
  const allHabits = useQuery(api.habits.getHabits, {}) || [];
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
