import { useEffect, useState } from "react";
import { useQuery, useMutation } from "convex/react";
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
  const [habitFormParentId, setHabitFormParentId] = useState<Id<"habits"> | null>(null);
  const [editingHabit, setEditingHabit] = useState<any>(null);

  const deleteHabit = useMutation(api.habits.deleteHabit);

  const toggleExpanded = (habitId: Id<"habits">) => {
    const newExpanded = new Set(expandedHabits);
    if (newExpanded.has(habitId)) {
      newExpanded.delete(habitId);
    } else {
      newExpanded.add(habitId);
    }
    setExpandedHabits(newExpanded);
  };

  const handleDeleteHabit = async (habitId: Id<"habits">) => {
    if (
      confirm(
        "Are you sure you want to delete this habit? This will also delete all sub-habits.",
      )
    ) {
      await deleteHabit({ habitId });
    }
  };

  const handleAddSubHabit = (parentId: Id<"habits">) => {
    setEditingHabit(null);
    setHabitFormParentId(parentId);
    setIsHabitFormOpen(true);
  };

  const handleEditSubHabit = (subHabit: any) => {
    setEditingHabit(subHabit);
    setHabitFormParentId(subHabit.parentId);
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
        onEditHabit={onEditHabit}
        handleDeleteHabit={handleDeleteHabit}
        handleAddSubHabit={handleAddSubHabit}
        handleEditSubHabit={handleEditSubHabit}
        handleDeleteSubHabit={handleDeleteHabit}
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
