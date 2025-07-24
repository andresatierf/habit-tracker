import { useQuery } from "convex/react";

import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

interface Props {
  className: HTMLDivElement["className"];
  parentId?: Id<"habits">;
  setParentId: React.Dispatch<React.SetStateAction<Id<"habits"> | undefined>>;
}

export function ParentInput({ className, parentId, setParentId }: Props) {
  const allHabits = useQuery(api.habits.getHabits, {});

  return (
    <div className={className}>
      <Label>Parent Habit (Optional)</Label>
      <Select
        value={parentId || ""}
        onValueChange={(value) => setParentId(value as Id<"habits">)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={null}>No Parent</SelectItem>
          {allHabits
            ?.filter((h) => h._id)
            .map((h) => (
              <SelectItem key={h._id} value={h._id}>
                {h.name}
              </SelectItem>
            ))}
        </SelectContent>
      </Select>
    </div>
  );
}
