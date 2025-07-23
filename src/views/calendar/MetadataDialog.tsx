import { useCallback, useEffect } from "react";

import { useForm } from "@tanstack/react-form";
import { useMutation } from "convex/react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStore } from "@/lib/store";

import { api } from "../../../convex/_generated/api";

type MetadataField = {
  name: string;
  type: "text" | "number" | "boolean" | "date" | "enum";
  options?: string[];
};

export function MetadataDialog() {
  const completionMetadata = useStore((state) => state.completionMetadata);
  const setCompletionMetadata = useStore(
    (state) => state.setCompletionMetadata,
  );

  const toggleCompletion = useMutation(api.completions.toggleCompletion);

  const form = useForm({
    defaultValues: {},
    onSubmit: async ({ value }) => {
      await onSave(value);
      setCompletionMetadata(null);
      form.reset();
    },
  });

  useEffect(() => {
    if (!completionMetadata) return;
    form.reset(completionMetadata.existingMetadata);
  }, [completionMetadata, form]);

  const validateField = useCallback(
    (fieldSchema) =>
      ({ value }) => {
        if (fieldSchema.type === "text" && !value) {
          return "This field is required";
        }
        if (
          fieldSchema.type === "number" &&
          (value === null || Number.isNaN(value))
        ) {
          return "Please enter a valid number";
        }
        if (fieldSchema.type === "date" && !value) {
          return "Please select a date";
        }
        return undefined;
      },
    [],
  );

  const onSave = useCallback(
    async (metadata: Record<string, any>) => {
      if (!completionMetadata) return;

      await toggleCompletion({
        date: completionMetadata.date,
        habitId: completionMetadata.habitId,
        completed: completionMetadata.completed,
        metadata: metadata,
      });
    },
    [completionMetadata, toggleCompletion],
  );

  return (
    <Dialog
      open={!!completionMetadata}
      onOpenChange={() => {
        setCompletionMetadata(null);
        form.reset();
      }}
    >
      <DialogContent className="bg-white">
        <DialogHeader>
          <DialogTitle>Add/Edit Metadata</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <div className="space-y-4 py-4">
            {completionMetadata?.metadataSchema?.map(
              (fieldSchema: MetadataField) => (
                <form.Field
                  key={fieldSchema.name}
                  name={fieldSchema.name}
                  validators={{
                    onChange: validateField(fieldSchema),
                    onBlur: validateField(fieldSchema),
                  }}
                >
                  {({
                    name,
                    state: {
                      value,
                      meta: { errors },
                    },
                    handleChange,
                    handleBlur,
                  }) => {
                    return (
                      <div key={name}>
                        <Label htmlFor={name}>{fieldSchema.name}</Label>
                        {fieldSchema.type === "text" && (
                          <Input
                            id={name}
                            type="text"
                            value={value || ""}
                            onChange={(e) => handleChange(e.target.value)}
                            onBlur={handleBlur}
                          />
                        )}
                        {fieldSchema.type === "number" && (
                          <Input
                            id={name}
                            type="number"
                            value={value || 0}
                            onChange={(e) =>
                              handleChange(parseFloat(e.target.value))
                            }
                            onBlur={handleBlur}
                          />
                        )}
                        {fieldSchema.type === "boolean" && (
                          <input
                            id={name}
                            type="checkbox"
                            checked={value || false}
                            onChange={(e) => handleChange(e.target.checked)}
                            onBlur={handleBlur}
                          />
                        )}
                        {fieldSchema.type === "date" && (
                          <Input
                            id={name}
                            type="date"
                            value={value || ""}
                            onChange={handleChange}
                            onBlur={handleBlur}
                          />
                        )}
                        {fieldSchema.type === "enum" && (
                          <Select
                            value={value || ""}
                            onValueChange={handleChange}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select an option" />
                            </SelectTrigger>
                            <SelectContent>
                              {fieldSchema.options?.map((option) => (
                                <SelectItem key={option} value={option}>
                                  {option}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                        {errors && (
                          <p className="mt-1 text-sm text-destructive">
                            {errors.join(", ")}
                          </p>
                        )}
                      </div>
                    );
                  }}
                </form.Field>
              ),
            )}
          </div>
          <DialogFooter>
            {form.state.meta?.errors && form.state.meta.errors.length > 0 && (
              <div className="mt-2 text-sm text-destructive">
                {form.state.meta.errors.map((error, index) => (
                  <p key={index}>{error}</p>
                ))}
              </div>
            )}
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={!form.state.isValid}>
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
