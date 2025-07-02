import { Button } from "@/components/button";
import type { Id } from "../../convex/_generated/dataModel";

interface HabitCompletionButtonProps {
  id: Id<"habits">;
  name: string;
  icon: string;
  color: string;
  isCompleted: boolean;
  onClick: (id: Id<"habits">) => void;
}

export function HabitCompletionButton({
  id,
  name,
  icon,
  color,
  isCompleted,
  onClick,
}: HabitCompletionButtonProps) {
  return (
    <Button
      key={id}
      onClick={() => onClick(id)}
      className={`w-full rounded p-1 text-left text-xs transition-colors ${
        isCompleted
          ? "bg-green-100 text-green-800"
          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
      }`}
      style={{
        borderLeft: `3px solid ${color}`,
      }}
    >
      <span className="mr-1">{icon}</span>
      {name}
    </Button>
  );
}
