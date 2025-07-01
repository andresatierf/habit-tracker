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
import { useForm } from "@tanstack/react-form";
import { Dispatch, SetStateAction, useCallback, useEffect } from "react";

interface MetadataDialogProps {
  selectedCompletion: any;
  setSelectedCompletion: Dispatch<SetStateAction<any>>;
  onSave: (metadata: Record<string, any>) => Promise<void>;
}

type MetadataField = {
  name: string;
  type: "text" | "number" | "boolean" | "date";
};

export function MetadataDialog({
  selectedCompletion,
  setSelectedCompletion,
  onSave,
}: MetadataDialogProps) {
  const form = useForm({
    defaultValues: {},
    onSubmit: async ({ value }) => {
      await onSave(value);
      setSelectedCompletion(null);
      form.reset();
    },
  });

  useEffect(() => {
    if (selectedCompletion) {
      form.reset(selectedCompletion.existingMetadata);
    }
  }, [selectedCompletion, form]);

  const validateField = useCallback(
    (fieldSchema) =>
      ({ value }) => {
        console.log({ fieldSchema, value });
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

  return (
    <Dialog
      open={!!selectedCompletion}
      onOpenChange={() => {
        setSelectedCompletion(null);
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
          <div className="py-4 space-y-4">
            {selectedCompletion?.metadataSchema.map(
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
                            onChange={(e) => handleChange(e.target.value)}
                            onBlur={handleBlur}
                          />
                        )}
                        {fieldSchema.type === "number" && (
                          <Input
                            id={name}
                            type="number"
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
                            onChange={handleChange}
                            onBlur={handleBlur}
                          />
                        )}
                        {errors && (
                          <p className="text-red-500 text-sm mt-1">
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
              <div className="text-red-500 text-sm mt-2">
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
