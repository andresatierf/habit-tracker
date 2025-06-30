import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { SubHabitForm } from "./SubHabitForm";
import { Id } from "../../convex/_generated/dataModel";

interface HabitListProps {
  habits: any[];
  onEditHabit: (habit: any) => void;
}

export function HabitList({ habits, onEditHabit }: HabitListProps) {
  const [expandedHabits, setExpandedHabits] = useState<Set<Id<"habits">>>(new Set());
  const [showSubHabitForm, setShowSubHabitForm] = useState<Id<"habits"> | null>(null);
  const [editingSubHabit, setEditingSubHabit] = useState<any>(null);

  const deleteHabit = useMutation(api.habits.deleteHabit);
  const deleteSubHabit = useMutation(api.habits.deleteSubHabit);

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
    if (confirm("Are you sure you want to delete this habit? This will also delete all sub-habits.")) {
      await deleteHabit({ habitId });
    }
  };

  const handleDeleteSubHabit = async (subHabitId: Id<"subHabits">) => {
    if (confirm("Are you sure you want to delete this sub-habit?")) {
      await deleteSubHabit({ subHabitId });
    }
  };

  const handleEditSubHabit = (subHabit: any) => {
    setEditingSubHabit(subHabit);
    setShowSubHabitForm(subHabit.habitId);
  };

  const handleCloseSubHabitForm = () => {
    setShowSubHabitForm(null);
    setEditingSubHabit(null);
  };

  return (
    <div className="space-y-4">
      {habits.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No habits yet. Create your first habit to get started!</p>
        </div>
      ) : (
        habits.map((habit) => (
          <HabitCard
            key={habit._id}
            habit={habit}
            isExpanded={expandedHabits.has(habit._id)}
            onToggleExpanded={() => toggleExpanded(habit._id)}
            onEdit={() => onEditHabit(habit)}
            onDelete={() => handleDeleteHabit(habit._id)}
            onAddSubHabit={() => setShowSubHabitForm(habit._id)}
            onEditSubHabit={handleEditSubHabit}
            onDeleteSubHabit={handleDeleteSubHabit}
          />
        ))
      )}

      {/* Sub-habit Form Modal */}
      {showSubHabitForm && (
        <SubHabitForm
          habitId={showSubHabitForm}
          subHabit={editingSubHabit}
          onClose={handleCloseSubHabitForm}
        />
      )}
    </div>
  );
}

interface HabitCardProps {
  habit: any;
  isExpanded: boolean;
  onToggleExpanded: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onAddSubHabit: () => void;
  onEditSubHabit: (subHabit: any) => void;
  onDeleteSubHabit: (subHabitId: Id<"subHabits">) => void;
}

function HabitCard({
  habit,
  isExpanded,
  onToggleExpanded,
  onEdit,
  onDelete,
  onAddSubHabit,
  onEditSubHabit,
  onDeleteSubHabit,
}: HabitCardProps) {
  const subHabits = useQuery(api.habits.getSubHabits, { habitId: habit._id }) || [];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: habit.color }}
            />
            <span className="text-2xl">{habit.icon}</span>
            <h3 className="text-lg font-semibold text-gray-900">{habit.name}</h3>
            {subHabits.length > 0 && (
              <span className="text-sm text-gray-500">({subHabits.length} sub-habits)</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onAddSubHabit}
              className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
            >
              Add Sub-habit
            </button>
            <button
              onClick={onEdit}
              className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
            >
              Edit
            </button>
            <button
              onClick={onDelete}
              className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
            >
              Delete
            </button>
            {subHabits.length > 0 && (
              <button
                onClick={onToggleExpanded}
                className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
              >
                {isExpanded ? "Collapse" : "Expand"}
              </button>
            )}
          </div>
        </div>

        {/* Sub-habits */}
        {isExpanded && subHabits.length > 0 && (
          <div className="mt-4 pl-8 space-y-2">
            {subHabits.map((subHabit) => (
              <div key={subHabit._id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: subHabit.color }}
                  />
                  <span className="text-lg">{subHabit.icon}</span>
                  <span className="text-gray-700">{subHabit.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onEditSubHabit(subHabit)}
                    className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDeleteSubHabit(subHabit._id)}
                    className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
