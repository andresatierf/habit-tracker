import { AnyFieldApi, useForm } from "@tanstack/react-form";
import { useMutation, useQuery } from "convex/react";
import { PlusCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MetadataTypes } from "@/shared/schema";

import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Checkbox } from "../ui/checkbox";
import {
  EmojiPicker,
  EmojiPickerContent,
  EmojiPickerSearch,
} from "../ui/emoji-picker";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

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

const schema = z.object({
  name: z.string().min(1, "Habit name is required"),
  color: z.string().min(7),
  icon: z.emoji(),
  parentId: z.string().optional(),
  metadataFields: z.array(z.object()),
});

type MetadataField = {
  name: string;
  type: "text" | "number" | "boolean" | "date" | "enum";
  options?: string[];
  defaultValue?: any;
};

function FieldInfo({ field }: { field: AnyFieldApi }) {
  return (
    <>
      {field.state.meta.isTouched && !field.state.meta.isValid ? (
        <em className="mt-1 text-sm text-destructive">
          {field.state.meta.errors.map((e) => e.message).join(", ")}
        </em>
      ) : null}
      {field.state.meta.isValidating ? "Validating..." : null}
    </>
  );
}

export function HabitForm({
  habitId,
  parentId,
  isOpen,
  onClose,
}: HabitFormProps) {
  const allHabits = useQuery(api.habits.getHabits, { includeSubHabits: true });
  const habit = useQuery(api.habits.getHabit, habitId ? { habitId } : "skip");

  const form = useForm({
    defaultValues: {
      name: habit?.name || "",
      color: habit?.color || COLORS[0],
      icon: habit?.icon || ICONS[0],
      parentId: habit?.parentId || parentId,
      metadataFields: habit?.metadata || ([] as MetadataField[]),
    },
    // validators: {
    //   onChange: schema,
    // },
    onSubmit: async ({ value }) => {
      if (!value.name.trim()) return;

      try {
        if (habit) {
          await updateHabit({
            habitId: habit._id,
            name: value.name.trim(),
            color: value.color,
            icon: value.icon,
            metadata: value.metadataFields,
            parentId: value.parentId,
          });
          toast.success(
            `${parentId ? "Sub-habit" : "Habit"} updated successfully!`,
          );
        } else {
          await createHabit({
            name: value.name.trim(),
            color: value.color,
            icon: value.icon,
            metadata: value.metadataFields,
            parentId: value.parentId,
          });
          toast.success(
            `${parentId ? "Sub-habit" : "Habit"} created successfully!`,
          );
        }
        onClose();
      } catch {
        toast.error("Failed to save " + (parentId ? "sub-habit" : "habit"));
      }
    },
  });

  const createHabit = useMutation(api.habits.createHabit);
  const updateHabit = useMutation(api.habits.updateHabit);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {habit ? "Edit Habit" : `Create New ${parentId ? "Sub " : ""}Habit`}
          </DialogTitle>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            e.stopPropagation();
            await form.handleSubmit();
          }}
        >
          <div className="flex gap-2">
            <form.Field
              name="name"
              children={(field) => (
                <div className="flex-[60%]">
                  <Label htmlFor="habit-name">Habit Name</Label>
                  <Input
                    id="habit-name"
                    type="text"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Enter habit name..."
                  />
                  <FieldInfo field={field} />
                </div>
              )}
            />
            <form.Field
              name="parentId"
              children={(field) => (
                <div className="flex-[40%]">
                  <Label>Parent Habit (Optional)</Label>
                  <Select
                    value={field.state.value}
                    onValueChange={(value) =>
                      field.handleChange(
                        value === "no_parent" ? undefined : value,
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Parent" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="no_parent">No Parent</SelectItem>
                      {allHabits
                        ?.filter((h) => h._id)
                        .map((h) => (
                          <SelectItem key={h._id} value={h._id}>
                            {h.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <FieldInfo field={field} />
                </div>
              )}
            />
          </div>
          <form.Field
            name="color"
            children={(field) => (
              <div>
                <Label>Color</Label>
                <div className="grid grid-cols-8 gap-2">
                  {COLORS.map((colorOption) => (
                    <Button
                      key={colorOption}
                      type="button"
                      onClick={() => field.handleChange(colorOption)}
                      className={`size-8 rounded-full border-2 ${
                        field.state.value === colorOption
                          ? "border-gray-900"
                          : "border-gray-300"
                      }`}
                      style={{ backgroundColor: colorOption }}
                      variant="outline"
                      size="icon"
                    />
                  ))}
                </div>
                <FieldInfo field={field} />
              </div>
            )}
          />
          <form.Field
            name="icon"
            children={(field) => (
              <div>
                <Label>Icon</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="font-normal"
                    >
                      <span className="text-lg">{field.state.value}</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="h-96 w-auto border-0 p-4">
                    <EmojiPicker
                      onEmojiSelect={(emoji) => field.handleChange(emoji.emoji)}
                      // icons={ICONS}
                    >
                      <div className="flex items-center border-b px-3">
                        <EmojiPickerSearch />
                      </div>
                      <EmojiPickerContent />
                    </EmojiPicker>
                  </PopoverContent>
                </Popover>
              </div>
            )}
          />
          <form.Field
            name="metadataFields"
            mode="array"
            children={(field) => (
              <>
                <Label className="mb-2 block">Metadata Fields</Label>
                {field.state.value.map((_, i) => (
                  <div key={i}>
                    <div className="flex items-center gap-2">
                      <form.Field
                        name={`metadataFields[${i}].name`}
                        children={(subfield) => (
                          <Input
                            type="text"
                            value={subfield.state.value}
                            onChange={(e) =>
                              subfield.handleChange(e.target.value)
                            }
                            placeholder="Field Name"
                            className="flex-1"
                          />
                        )}
                      />
                      <form.Field
                        name={`metadataFields[${i}].type`}
                        children={(subfield) => (
                          <Select
                            value={subfield.state.value}
                            onValueChange={(value: MetadataField["type"]) =>
                              subfield.handleChange(value)
                            }
                          >
                            <SelectTrigger className="w-[120px]">
                              <SelectValue placeholder="Select Type" />
                            </SelectTrigger>
                            <SelectContent>
                              {MetadataTypes.map((type) => (
                                <SelectItem key={type} value={type}>
                                  {type}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => field.removeValue(i)}
                      >
                        <XCircle className="size-5 text-destructive" />
                      </Button>
                    </div>
                    <form.Subscribe
                      selector={(state) => [
                        state.values.metadataFields[i].type,
                        state.values.metadataFields[i].options,
                      ]}
                      children={([type, options]) =>
                        type === "enum" && (
                          <div className="ml-8 mt-2 space-y-2">
                            <form.Field
                              name={`metadataFields[${i}].options`}
                              children={(optionField) => (
                                <>
                                  <Label>Options</Label>
                                  {(options as string[])?.map((option, j) => (
                                    <div
                                      key={j}
                                      className="flex items-center gap-2"
                                    >
                                      <form.Field
                                        name={`metadataFields[${i}].options[${j}]`}
                                        children={(optionSubfield) => (
                                          <>
                                            <Input
                                              type="text"
                                              value={optionSubfield.state.value}
                                              onChange={(e) =>
                                                optionSubfield.handleChange(
                                                  e.target.value,
                                                )
                                              }
                                              placeholder={`Option ${j + 1}`}
                                              className="flex-1"
                                            />
                                            <Button
                                              type="button"
                                              variant="ghost"
                                              size="icon"
                                              onClick={() =>
                                                optionField.removeValue(j)
                                              }
                                            >
                                              <XCircle className="size-5 text-destructive" />
                                            </Button>
                                          </>
                                        )}
                                      />
                                    </div>
                                  ))}
                                  <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => optionField.pushValue("")}
                                  >
                                    <PlusCircle className="mr-2 size-4" /> Add
                                    Option
                                  </Button>
                                </>
                              )}
                            />
                          </div>
                        )
                      }
                    />
                    <form.Subscribe
                      selector={(state) => [
                        state.values.metadataFields[i].type,
                        state.values.metadataFields[i].options,
                      ]}
                      children={([type, options]) => (
                        <div className="ml-8 mt-2 space-y-2">
                          <form.Field
                            name={`metadataFields[${i}].defaultValue`}
                            children={(defaultValueField) => (
                              <>
                                <Label className="mb-2 block text-sm font-medium text-gray-700">
                                  Default Value
                                </Label>
                                {type === "boolean" ? (
                                  <Checkbox
                                    checked={
                                      defaultValueField.state.value || false
                                    }
                                    onCheckedChange={(checked) =>
                                      defaultValueField.handleChange(checked)
                                    }
                                  />
                                ) : type === "enum" ? (
                                  <Select
                                    value={defaultValueField.state.value || ""}
                                    onValueChange={(value) =>
                                      defaultValueField.handleChange(value)
                                    }
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select an option" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {(options as string[])
                                        ?.filter((option) => option)
                                        .map((option) => (
                                          <SelectItem
                                            key={option}
                                            value={option}
                                          >
                                            {option}
                                          </SelectItem>
                                        ))}
                                    </SelectContent>
                                  </Select>
                                ) : (
                                  <Input
                                    type={
                                      type === "number"
                                        ? "number"
                                        : type === "date"
                                          ? "date"
                                          : "text"
                                    }
                                    value={defaultValueField.state.value || ""}
                                    onChange={(e) =>
                                      defaultValueField.handleChange(
                                        e.target.value,
                                      )
                                    }
                                    placeholder="Default Value"
                                  />
                                )}
                              </>
                            )}
                          />
                        </div>
                      )}
                    />
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  className="mt-2 w-full"
                  onClick={() =>
                    field.pushValue({
                      name: "",
                      type: "text",
                      options: ["test"],
                      defaultValue: "",
                    })
                  }
                >
                  <PlusCircle className="mr-2 size-4" /> Add Metadata Field
                </Button>
              </>
            )}
          />
          <div className="rounded-md bg-gray-50 p-3">
            <div className="flex items-center gap-3">
              <form.Subscribe
                selector={({ values: { name, color, icon } }) => [
                  name,
                  color,
                  icon,
                ]}
                children={([name, color, icon]) => (
                  <>
                    <div
                      className="size-4 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-xl">{icon}</span>
                    <span className="font-medium">{name || "Habit Name"}</span>
                  </>
                )}
              />
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
            <form.Subscribe
              selector={({ canSubmit, isSubmitting }) => [
                canSubmit,
                isSubmitting,
              ]}
              children={([canSubmit, isSubmitting]) => (
                <Button
                  type="submit"
                  disabled={!canSubmit || isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? "Saving..." : habit ? "Update" : "Create"}
                </Button>
              )}
            />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
