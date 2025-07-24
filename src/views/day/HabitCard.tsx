import { useCallback } from "react";

import { useMutation } from "convex/react";
import _ from "lodash";
import { Settings } from "lucide-react";

import { cn } from "@/lib/utils";
import { useStore } from "@/shared/store";

import { api } from "../../../convex/_generated/api";
import { Doc, Id } from "../../../convex/_generated/dataModel";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";

interface HabitCardProps {
  className?: string;
  habit: Doc<"habits">;
  completion?: Doc<"completions">;
  date: string;
  onEditHabit: (habitId: Id<"habits">) => void;
}

export function HabitCard({
  className,
  habit,
  completion,
  date,
  onEditHabit,
}: HabitCardProps) {
  const setCompletionMetadata = useStore(
    (state) => state.completion.setMetadata,
  );

  const toggleCompletion = useMutation(api.completions.toggleCompletion);

  const onOpen = useCallback(() => {
    setCompletionMetadata({
      date,
      habitId: habit._id,
      completed: completion?.completed || true,
      schema: habit.metadata || [],
      initial: completion?.metadata || [],
    });
  }, [completion, date, habit, setCompletionMetadata]);

  const handleOnClick = useCallback(async () => {
    if (completion?.completed || false) {
      await toggleCompletion({
        date: date.toString(),
        habitId: habit._id,
        completed: false,
        metadata: completion?.metadata,
      });
      return;
    }

    if (habit.metadata && habit.metadata.length > 0) {
      onOpen();
    } else {
      await toggleCompletion({
        date: date.toString(),
        habitId: habit._id,
        completed: true,
      });
    }
  }, [completion, date, habit, onOpen, toggleCompletion]);

  return (
    <Card
      className={cn(
        "mb-4 flex flex-col justify-between bg-red-50 relative",
        className,
        {
          "bg-green-50": completion?.completed,
          "bg-yellow-50":
            completion?.completed &&
            Object.values(completion?.metadata || {}).some((m) => !m),
        },
      )}
    >
      <CardHeader>
        <CardTitle>
          {habit.icon} {habit.name}
        </CardTitle>
        <Button
          variant="outline"
          size="icon"
          className="absolute right-2 top-1"
          onClick={() => onEditHabit(habit._id)}
        >
          <Settings className="size-4" />
        </Button>
      </CardHeader>
      <CardContent>
        {habit.metadata?.map((m) => (
          <div className="flex w-full justify-between gap-4 ">
            <span className="font-bold">{_.startCase(m.name)}</span>
            <span>{completion?.metadata?.[m.name] || m.defaultValue}</span>
          </div>
        ))}
      </CardContent>
      <CardFooter className="flex justify-end gap-4">
        {completion?.completed && !!habit.metadata?.length && (
          <Button variant="outline" onClick={onOpen}>
            Edit Metadata
          </Button>
        )}
        <Button onClick={() => handleOnClick()}>
          {completion?.completed ? "Mark as Incomplete" : "Mark as Complete"}
        </Button>
      </CardFooter>
    </Card>
  );
}
