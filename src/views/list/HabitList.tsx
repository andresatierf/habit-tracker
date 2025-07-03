import { useQuery } from "convex/react";
import { useEffect, useState } from "react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { HabitForm } from "../../components/HabitForm";
import { HabitListContent } from "./HabitListContent";

interface HabitListProps {
  onEditHabit: (habit: any) => void;
}

export function HabitList({ onEditHabit }: HabitListProps) {
  const allHabits = useQuery(api.habits.getHabits) || [];

  useEffect(() => {
    if (allHabits.length > 0) {
      const initialExpanded = new Set(allHabits.map((habit) => habit._id));
      setExpandedHabits(initialExpanded);
    }
  }, [allHabits]);

  const [expandedHabits, setExpandedHabits] = useState<Set<Id<"habits">>>(
    new Set(),
  );
  const [isHabitFormOpen, setIsHabitFormOpen] = useState(false);
  const [habitFormParentId, setHabitFormParentId] =
    useState<Id<"habits"> | null>(null);
  const [editingHabit, setEditingHabit] = useState<any>(null);

  const toggleExpanded = (habitId: Id<"habits">) => {
    const newExpanded = new Set(expandedHabits);
    if (newExpanded.has(habitId)) {
      newExpanded.delete(habitId);
    } else {
      newExpanded.add(habitId);
    }
    setExpandedHabits(newExpanded);
  };

  const handleAddSubHabit = (parentId: Id<"habits">) => {
    setEditingHabit(null);
    setHabitFormParentId(parentId);
    setIsHabitFormOpen(true);
  };

  const handleCloseHabitForm = () => {
    setIsHabitFormOpen(false);
    setEditingHabit(null);
    setHabitFormParentId(null);
  };

  return (
    <div className="space-y-4">
      <HabitListContent
        allHabits={allHabits}
        expandedHabits={expandedHabits}
        toggleExpanded={toggleExpanded}
        onAdd={handleAddSubHabit}
        onEdit={onEditHabit}
      />

      <HabitForm
        habit={editingHabit}
        parentId={habitFormParentId}
        isOpen={isHabitFormOpen}
        onClose={handleCloseHabitForm}
      />
    </div>
  );
}
