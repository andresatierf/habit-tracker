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
import { Dispatch, SetStateAction } from "react";

interface MetadataDialogProps {
  selectedCompletion: any;
  setSelectedCompletion: Dispatch<SetStateAction<any>>;
  form: ReturnType<typeof useForm>;
}

type MetadataField = {
  name: string;
  type: "text" | "number" | "boolean" | "date";
};

export function MetadataDialog({
  selectedCompletion,
  setSelectedCompletion,
  form,
}: MetadataDialogProps) {
  return (
    <Dialog
      open={!!selectedCompletion}
      onOpenChange={() => setSelectedCompletion(null)}
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
            {selectedCompletion.metadataSchema.map(
              (fieldSchema: MetadataField) => (
                <form.Field
                  key={fieldSchema.name}
                  name={fieldSchema.name}
                  validators={{
                    onChange: ({ value }) => {
                      if (fieldSchema.type === "text" && !value) {
                        return "This field is required";
                      }
                      if (
                        fieldSchema.type === "number" &&
                        (value === null || isNaN(value))
                      ) {
                        return "Please enter a valid number";
                      }
                      if (fieldSchema.type === "date" && !value) {
                        return "Please select a date";
                      }
                      return undefined;
                    },
                  }}
                >
                  {(field) => {
                    const fieldName = field.name;
                    const fieldValue = field.state.value;
                    const fieldErrors = field.state.meta.errors;

                    return (
                      <div key={fieldName}>
                        <Label htmlFor={fieldName}>{fieldSchema.name}</Label>
                        {fieldSchema.type === "text" && (
                          <Input
                            id={fieldName}
                            type="text"
                            {...field.getInputProps()}
                          />
                        )}
                        {fieldSchema.type === "number" && (
                          <Input
                            id={fieldName}
                            type="number"
                            {...field.getInputProps()}
                            onChange={(e) =>
                              field.handleChange(parseFloat(e.target.value))
                            }
                          />
                        )}
                        {fieldSchema.type === "boolean" && (
                          <input
                            id={fieldName}
                            type="checkbox"
                            {...field.getInputProps()}
                            checked={fieldValue || false}
                            onChange={(e) =>
                              field.handleChange(e.target.checked)
                            }
                          />
                        )}
                        {fieldSchema.type === "date" && (
                          <Input
                            id={fieldName}
                            type="date"
                            {...field.getInputProps()}
                          />
                        )}
                        {fieldErrors && (
                          <p className="text-red-500 text-sm mt-1">
                            {fieldErrors.join(", ")}
                          </p>
                        )}
                      </div>
                    );
                  }}
                </form.Field>
              )
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
