import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMutation } from "convex/react";
import { PlusCircle, XCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { api } from "../../convex/_generated/api";

interface HabitFormProps {
  habit?: any;
  onClose: () => void;
}

const COLORS = [
  "#ef4444",
  "#f97316",
  "#f59e0b",
  "#eab308",
  "#84cc16",
  "#22c55e",
  "#10b981",
  "#14b8a6",
  "#06b6d4",
  "#0ea5e9",
  "#3b82f6",
  "#6366f1",
  "#8b5cf6",
  "#a855f7",
  "#d946ef",
  "#ec4899",
  "#f43f5e",
];

const ICONS = [
  "💪",
  "🏃",
  "📚",
  "💧",
  "🧘",
  "🎯",
  "✍️",
  "🎵",
  "🎨",
  "🍎",
  "🌱",
  "💤",
  "🧹",
  "💰",
  "📱",
  "🚫",
  "⏰",
  "🔥",
  "⭐",
  "🎉",
];

type MetadataField = {
  name: string;
  type: "text" | "number" | "boolean" | "date" | "enum";
  options?: string[];
};

export function HabitForm({ habit, onClose }: HabitFormProps) {
  const [name, setName] = useState(habit?.name || "");
  const [color, setColor] = useState(habit?.color || COLORS[0]);
  const [icon, setIcon] = useState(habit?.icon || ICONS[0]);
  const [metadataFields, setMetadataFields] = useState<MetadataField[]>(
    habit?.metadata || []
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createHabit = useMutation(api.habits.createHabit);
  const updateHabit = useMutation(api.habits.updateHabit);

  const handleAddMetadataField = () => {
    setMetadataFields([
      ...metadataFields,
      { name: "", type: "text", options: [] },
    ]);
  };

  const handleMetadataFieldNameChange = (index: number, value: string) => {
    const newFields = [...metadataFields];
    newFields[index].name = value;
    setMetadataFields(newFields);
  };

  const handleMetadataFieldTypeChange = (
    index: number,
    value: MetadataField["type"]
  ) => {
    const newFields = [...metadataFields];
    newFields[index].type = value;
    if (value !== "enum") {
      newFields[index].options = undefined;
    } else {
      newFields[index].options = [];
    }
    setMetadataFields(newFields);
  };

  const handleMetadataFieldOptionsChange = (index: number, optionIndex: number, value: string) => {
    const newFields = [...metadataFields];
    if (newFields[index].options) {
      newFields[index].options![optionIndex] = value;
    }
    setMetadataFields(newFields);
  };

  const handleAddOption = (index: number) => {
    const newFields = [...metadataFields];
    if (newFields[index].options) {
      newFields[index].options!.push("");
    } else {
      newFields[index].options = [""];
    }
    setMetadataFields(newFields);
  };

  const handleRemoveOption = (index: number, optionIndex: number) => {
    const newFields = [...metadataFields];
    if (newFields[index].options) {
      newFields[index].options!.splice(optionIndex, 1);
    }
    setMetadataFields(newFields);
  };

  const handleRemoveMetadataField = (index: number) => {
    const newFields = metadataFields.filter((_, i) => i !== index);
    setMetadataFields(newFields);
  };

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
          metadata: metadataFields,
        });
        toast.success("Habit updated successfully!");
      } else {
        await createHabit({
          name: name.trim(),
          color,
          icon,
          metadata: metadataFields,
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
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {habit ? "Edit Habit" : "Create New Habit"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <Label htmlFor="habit-name">Habit Name</Label>
              <Input
                id="habit-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter habit name..."
                required
              />
            </div>

            {/* Color */}
            <div>
              <Label>Color</Label>
              <div className="grid grid-cols-8 gap-2">
                {COLORS.map((colorOption) => (
                  <button
                    key={colorOption}
                    type="button"
                    onClick={() => setColor(colorOption)}
                    className={`w-8 h-8 rounded-full border-2 ${
                      color === colorOption
                        ? "border-gray-900"
                        : "border-gray-300"
                    }`}
                    style={{ backgroundColor: colorOption }}
                  />
                ))}
              </div>
            </div>

            {/* Icon */}
            <div>
              <Label>Icon</Label>
              <div className="grid grid-cols-10 gap-2">
                {ICONS.map((iconOption) => (
                  <button
                    key={iconOption}
                    type="button"
                    onClick={() => setIcon(iconOption)}
                    className={`w-8 h-8 text-lg flex items-center justify-center rounded border-2 ${
                      icon === iconOption
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-300"
                    }`}
                  >
                    {iconOption}
                  </button>
                ))}
              </div>
            </div>

            {/* Metadata Fields */}
            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-2">
                Metadata Fields
              </Label>
              <div className="space-y-2">
                {metadataFields.map((field, index) => (
                  <div key={index}>
                    <div className="flex items-center gap-2">
                      <Input
                        type="text"
                        value={field.name}
                        onChange={(e) =>
                          handleMetadataFieldNameChange(index, e.target.value)
                        }
                        placeholder="Field Name"
                        className="flex-1"
                      />
                      <Select
                        value={field.type}
                        onValueChange={(value: MetadataField["type"]) =>
                          handleMetadataFieldTypeChange(index, value)
                        }
                      >
                        <SelectTrigger className="w-[120px]">
                          <SelectValue placeholder="Select Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="text">Text</SelectItem>
                          <SelectItem value="number">Number</SelectItem>
                          <SelectItem value="boolean">Boolean</SelectItem>
                          <SelectItem value="date">Date</SelectItem>
                          <SelectItem value="enum">Enum</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveMetadataField(index)}
                      >
                        <XCircle className="h-5 w-5 text-red-500" />
                      </Button>
                    </div>
                    {field.type === "enum" && (
                      <div className="ml-8 mt-2 space-y-2">
                        <Label>Options</Label>
                        {field.options?.map((option, optionIndex) => (
                          <div key={optionIndex} className="flex items-center gap-2">
                            <Input
                              type="text"
                              value={option}
                              onChange={(e) =>
                                handleMetadataFieldOptionsChange(
                                  index,
                                  optionIndex,
                                  e.target.value
                                )
                              }
                              placeholder={`Option ${optionIndex + 1}`}
                              className="flex-1"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveOption(index, optionIndex)}
                            >
                              <XCircle className="h-5 w-5 text-red-500" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full"
                          onClick={() => handleAddOption(index)}
                        >
                          <PlusCircle className="mr-2 h-4 w-4" /> Add Option
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <Button
                type="button"
                variant="outline"
                className="mt-2 w-full"
                onClick={handleAddMetadataField}
              >
                <PlusCircle className="mr-2 h-4 w-4" /> Add Metadata Field
              </Button>
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
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !name.trim()}
                className="flex-1"
              >
                {isSubmitting ? "Saving..." : habit ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
