import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

interface HabitFormProps {
  habit?: any;
  onClose: () => void;
}

const COLORS = [
  "#ef4444", "#f97316", "#f59e0b", "#eab308", "#84cc16",
  "#22c55e", "#10b981", "#14b8a6", "#06b6d4", "#0ea5e9",
  "#3b82f6", "#6366f1", "#8b5cf6", "#a855f7", "#d946ef",
  "#ec4899", "#f43f5e"
];

const ICONS = [
  "💪", "🏃", "📚", "💧", "🧘", "🎯", "✍️", "🎵", "🎨", "🍎",
  "🌱", "💤", "🧹", "💰", "📱", "🚫", "⏰", "🔥", "⭐", "🎉"
];

export function HabitForm({ habit, onClose }: HabitFormProps) {
  const [name, setName] = useState(habit?.name || "");
  const [color, setColor] = useState(habit?.color || COLORS[0]);
  const [icon, setIcon] = useState(habit?.icon || ICONS[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createHabit = useMutation(api.habits.createHabit);
  const updateHabit = useMutation(api.habits.updateHabit);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      if (habit) {
        await updateHabit({
          habitId: habit._id,
          name: name.trim(),
          color,
          icon,
        });
        toast.success("Habit updated successfully!");
      } else {
        await createHabit({
          name: name.trim(),
          color,
          icon,
        });
        toast.success("Habit created successfully!");
      }
      onClose();
    } catch (error) {
      toast.error("Failed to save habit");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {habit ? "Edit Habit" : "Create New Habit"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Habit Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter habit name..."
                required
              />
            </div>

            {/* Color */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Color
              </label>
              <div className="grid grid-cols-8 gap-2">
                {COLORS.map((colorOption) => (
                  <button
                    key={colorOption}
                    type="button"
                    onClick={() => setColor(colorOption)}
                    className={`w-8 h-8 rounded-full border-2 ${
                      color === colorOption ? "border-gray-900" : "border-gray-300"
                    }`}
                    style={{ backgroundColor: colorOption }}
                  />
                ))}
              </div>
            </div>

            {/* Icon */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Icon
              </label>
              <div className="grid grid-cols-10 gap-2">
                {ICONS.map((iconOption) => (
                  <button
                    key={iconOption}
                    type="button"
                    onClick={() => setIcon(iconOption)}
                    className={`w-8 h-8 text-lg flex items-center justify-center rounded border-2 ${
                      icon === iconOption ? "border-blue-500 bg-blue-50" : "border-gray-300"
                    }`}
                  >
                    {iconOption}
                  </button>
                ))}
              </div>
            </div>

            {/* Preview */}
            <div className="p-3 bg-gray-50 rounded-md">
              <div className="flex items-center gap-3">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <span className="text-xl">{icon}</span>
                <span className="font-medium">{name || "Habit Name"}</span>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !name.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? "Saving..." : habit ? "Update" : "Create"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
