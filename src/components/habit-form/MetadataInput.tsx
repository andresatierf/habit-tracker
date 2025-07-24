import { PlusCircle, XCircle } from "lucide-react";

import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

type MetadataField = {
  name: string;
  type: "text" | "number" | "boolean" | "date" | "enum";
  options?: string[];
  defaultValue?: any;
};

interface Props {
  metadataFields: MetadataField[];
  setMetadataFields: React.Dispatch<React.SetStateAction<MetadataField[]>>;
}

export function MetadataInput({ metadataFields, setMetadataFields }: Props) {
  const handleAddMetadataField = () => {
    setMetadataFields([
      ...metadataFields,
      { name: "", type: "text", options: [], defaultValue: undefined },
    ]);
  };

  const handleMetadataFieldNameChange = (index: number, value: string) => {
    const newFields = [...metadataFields];
    newFields[index].name = value;
    setMetadataFields(newFields);
  };

  const handleMetadataFieldTypeChange = (
    index: number,
    value: MetadataField["type"],
  ) => {
    const newFields = [...metadataFields];
    newFields[index].type = value;
    if (value !== "enum") {
      newFields[index].options = undefined;
    } else {
      newFields[index].options = [];
    }
    newFields[index].defaultValue = undefined; // Reset defaultValue when type changes
    setMetadataFields(newFields);
  };

  const handleMetadataFieldDefaultValueChange = (index: number, value: any) => {
    const newFields = [...metadataFields];
    newFields[index].defaultValue = value;
    setMetadataFields(newFields);
  };

  const handleMetadataFieldOptionsChange = (
    index: number,
    optionIndex: number,
    value: string,
  ) => {
    const newFields = [...metadataFields];
    if (newFields[index].options) {
      newFields[index].options[optionIndex] = value;
    }
    setMetadataFields(newFields);
  };

  const handleAddOption = (index: number) => {
    const newFields = [...metadataFields];
    if (newFields[index].options) {
      newFields[index].options.push("");
    } else {
      newFields[index].options = [""];
    }
    setMetadataFields(newFields);
  };

  const handleRemoveOption = (index: number, optionIndex: number) => {
    const newFields = [...metadataFields];
    if (newFields[index].options) {
      newFields[index].options.splice(optionIndex, 1);
    }
    setMetadataFields(newFields);
  };

  const handleRemoveMetadataField = (index: number) => {
    const newFields = metadataFields.filter((_, i) => i !== index);
    setMetadataFields(newFields);
  };

  console.log({ metadataFields });

  return (
    <div>
      <Label className="mb-2 block">Metadata Fields</Label>
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
                <XCircle className="size-5 text-destructive" />
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
                          e.target.value,
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
                      <XCircle className="size-5 text-destructive" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => handleAddOption(index)}
                >
                  <PlusCircle className="mr-2 size-4" /> Add Option
                </Button>
              </div>
            )}
            <div className="ml-8 mt-2 space-y-2">
              <Label className="mb-2 block text-sm font-medium text-gray-700">
                Default Value
              </Label>
              {field.type === "boolean" ? (
                <Checkbox
                  checked={field.defaultValue || false}
                  onCheckedChange={(checked) =>
                    handleMetadataFieldDefaultValueChange(index, checked)
                  }
                />
              ) : field.type === "enum" ? (
                <Select
                  value={field.defaultValue || ""}
                  onValueChange={(value) =>
                    handleMetadataFieldDefaultValueChange(index, value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an option" />
                  </SelectTrigger>
                  <SelectContent>
                    {field.options
                      ?.filter((option) => option)
                      .map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  type={
                    field.type === "number"
                      ? "number"
                      : field.type === "date"
                        ? "date"
                        : "text"
                  }
                  value={field.defaultValue || ""}
                  onChange={(e) =>
                    handleMetadataFieldDefaultValueChange(index, e.target.value)
                  }
                  placeholder="Default Value"
                />
              )}
            </div>
          </div>
        ))}
      </div>
      <Button
        type="button"
        variant="outline"
        className="mt-2 w-full"
        onClick={handleAddMetadataField}
      >
        <PlusCircle className="mr-2 size-4" /> Add Metadata Field
      </Button>
    </div>
  );
}
