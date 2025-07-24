import { useEffect, useState } from "react";

import { useMutation, useQuery } from "convex/react";
import { PlusCircle, XCircle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  EmojiPicker,
  EmojiPickerContent,
  EmojiPickerSearch,
} from "@/components/ui/emoji-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";

import { ColorInput } from "./ColorInput";
import { IconInput } from "./IconInput";
import { MetadataInput } from "./MetadataInput";
import { NameInput } from "./NameInput";
import { ParentInput } from "./ParentInput";

interface HabitFormProps {
  habitId?: Id<"habits">;
  parentId?: Id<"habits">;
  isOpen: boolean;
  onClose: () => void;
}

const COLORS = [
  "#ef4444", // red-500
  "#f97316", // orange-500
  "#f59e0b", // amber-500
  "#eab308", // yellow-500
  "#84cc16", // lime-500
  "#22c55e", // green-500
  "#10b981", // emerald-500
  "#14b8a6", // teal-500
  "#06b6d4", // cyan-500
  "#0ea5e9", // sky-500
  "#3b82f6", // blue-500
  "#6366f1", // indigo-500
  "#8b5cf6", // violet-500
  "#a855f7", // purple-500
  "#d946ef", // fuchsia-500
  "#ec4899", // pink-500
  "#f43f5e", // rose-500
];

// prettier-ignore
const ICONS = [
  "💪", "🏃", "📚", "💧",
  "🧘", "🎯", "✍️", "🎵",
  "🎨", "🍎", "🌱", "💤",
  "🧹", "💰", "📱", "🚫",
  "⏰", "🔥", "⭐", "🎉",
];

type MetadataField = {
  name: string;
  type: "text" | "number" | "boolean" | "date" | "enum";
  options?: string[];
  defaultValue?: any;
};

export function HabitForm({
  habitId,
  parentId,
  isOpen,
  onClose,
}: HabitFormProps) {
  const habit = useQuery(api.habits.getHabit, habitId ? { habitId } : "skip");
  const [name, setName] = useState("");
  const [color, setColor] = useState(COLORS[0]);
  const [icon, setIcon] = useState(ICONS[0]);
  const [metadataFields, setMetadataFields] = useState<MetadataField[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedParentId, setSelectedParentId] = useState<
    Id<"habits"> | undefined
  >(parentId);

  const createHabit = useMutation(api.habits.createHabit);
  const updateHabit = useMutation(api.habits.updateHabit);

  useEffect(() => {
    if (isOpen) {
      setName(habit?.name || "");
      setColor(habit?.color || COLORS[0]);
      setIcon(habit?.icon || ICONS[0]);
      setMetadataFields(habit?.metadata || []);
      setSelectedParentId(habit?.parentId || parentId);
    }
  }, [isOpen, habit, parentId]);

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
          parentId: selectedParentId,
        });
        toast.success(
          `${parentId ? "Sub-habit" : "Habit"} updated successfully!`,
        );
      } else {
        await createHabit({
          name: name.trim(),
          color,
          icon,
          metadata: metadataFields,
          parentId: selectedParentId,
        });
        toast.success(
          `${parentId ? "Sub-habit" : "Habit"} created successfully!`,
        );
      }
      onClose();
    } catch {
      toast.error("Failed to save " + (parentId ? "sub-habit" : "habit"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {habit ? "Edit Habit" : `Create New ${parentId ? "Sub " : ""}Habit`}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-2">
            <NameInput className="flex-[60%]" name={name} setName={setName} />
            <ParentInput
              className="flex-[40%]"
              parentId={selectedParentId}
              setParentId={setSelectedParentId}
            />
          </div>
          <ColorInput color={color} setColor={setColor} />
          <IconInput icon={icon} setIcon={setIcon} />
          <MetadataInput
            metadataFields={metadataFields}
            setMetadataFields={setMetadataFields}
          />
          {/* Preview */}
          <div className="rounded-md bg-gray-50 p-3">
            <div className="flex items-center gap-3">
              <div
                className="size-4 rounded-full"
                style={{ backgroundColor: color }}
              />
              <span className="text-xl">{icon}</span>
              <span className="font-medium">{name || "Habit Name"}</span>
            </div>
          </div>
          <DialogFooter>
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
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
