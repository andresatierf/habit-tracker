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
import { useStore } from "@/shared/store";

import { api } from "../../convex/_generated/api";

import { RadioGroup, RadioGroupItem } from "./ui/radio-group";

type MetadataField = {
  name: string;
  type: "text" | "number" | "boolean" | "date" | "enum";
  options?: string[];
};

export function MetadataDialog() {
  const completionMetadata = useStore((state) => state.completion.metadata);
  const setCompletionMetadata = useStore(
    (state) => state.completion.setMetadata,
  );

  const toggleCompletion = useMutation(api.completions.toggleCompletion);

  const form = useForm({
    defaultValues: completionMetadata?.initial,
    onSubmit: async ({ value }) => {
      await onSave(value);
      setCompletionMetadata(null);
      form.reset();
    },
  });

  useEffect(() => {
    if (!completionMetadata) return;
    form.reset(completionMetadata.initial);
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
        if (
          fieldSchema.type === "boolean" &&
          value !== true &&
          value !== false
        ) {
          return "Please select a value";
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
          onSubmit={async (e) => {
            e.preventDefault();
            e.stopPropagation();
            await form.handleSubmit();
          }}
        >
          <div className="space-y-4 py-4">
            {completionMetadata?.schema?.map((fieldSchema: MetadataField) => (
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
                }) => {
                  return (
                    <div key={name}>
                      <Label htmlFor={name}>{fieldSchema.name}</Label>
                      {fieldSchema.type === "text" && (
                        <Input
                          id={name}
                          type="text"
                          value={value as string}
                          onChange={(e) => handleChange(e.target.value)}
                        />
                      )}
                      {fieldSchema.type === "number" && (
                        <Input
                          id={name}
                          type="number"
                          value={value as number}
                          onChange={(e) =>
                            handleChange(parseFloat(e.target.value))
                          }
                        />
                      )}
                      {fieldSchema.type === "boolean" && (
                        <RadioGroup
                          className="mt-2 flex gap-16"
                          value={
                            value === true
                              ? "true"
                              : value === false
                                ? "false"
                                : undefined
                          }
                          onValueChange={(value) =>
                            handleChange(
                              value === "true"
                                ? true
                                : value === "false"
                                  ? false
                                  : undefined,
                            )
                          }
                        >
                          <div className="flex gap-2">
                            <RadioGroupItem id="radio-true" value="true" />
                            <Label htmlFor="radio-true">True</Label>
                          </div>
                          <div className="flex gap-2">
                            <RadioGroupItem id="radio-false" value="false" />
                            <Label htmlFor="radio-false">False</Label>
                          </div>
                        </RadioGroup>
                      )}
                      {fieldSchema.type === "date" && (
                        <Input
                          id={name}
                          type="date"
                          value={value as string}
                          onChange={(e) => handleChange(e.target.value)}
                        />
                      )}
                      {fieldSchema.type === "enum" && (
                        <Select
                          value={value as string}
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
            ))}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button
                variant="outline"
                onClick={() => setCompletionMetadata(null)}
              >
                Cancel
              </Button>
            </DialogClose>
            <form.Subscribe
              selector={({ canSubmit, isSubmitting }) => [
                canSubmit,
                isSubmitting,
              ]}
              children={([canSubmit, isSubmitting]) => (
                <Button
                  type="submit"
                  disabled={!canSubmit || isSubmitting}
                  loading={isSubmitting}
                >
                  {isSubmitting ? "Saving..." : "Save"}
                </Button>
              )}
            />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
