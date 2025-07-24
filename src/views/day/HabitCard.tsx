import { useState } from "react";

import { useMutation } from "convex/react";
import _ from "lodash";

import { cn } from "@/lib/utils";
import { useStore } from "@/shared/store";

import { api } from "../../../convex/_generated/api";
import { Doc } from "../../../convex/_generated/dataModel";
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
}

export function HabitCard({
  className,
  habit,
  completion,
  date,
}: HabitCardProps) {
  const setCompletionMetadata = useStore(
    (state) => state.completion.setMetadata,
  );

  const toggleCompletion = useMutation(api.completions.toggleCompletion);

  const handleToggle = async () => {
    await toggleCompletion({ habitId: habit._id, date });
  };

  const onOpen = () => {
    setCompletionMetadata({
      date,
      habitId: habit._id,
      completed: completion?.completed || true,
      schema: habit.metadata || [],
      initial: completion?.metadata || [],
    });
  };

  return (
    <Card
      className={cn("mb-4 flex flex-col justify-between", className, {
        "bg-green-100": completion?.completed,
      })}
    >
      <CardHeader>
        <CardTitle>
          {habit.icon} {habit.name}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {habit.metadata?.map((m) => (
          <p className="flex w-full justify-between gap-4 ">
            <span className="font-bold">{_.startCase(m.name)}</span>
            <span>{completion?.metadata?.[m.name]}</span>
          </p>
        ))}
      </CardContent>
      <CardFooter className="flex justify-end gap-4">
        {completion?.completed && (
          <Button variant="outline" onClick={onOpen}>
            Edit Metadata
          </Button>
        )}
        <Button onClick={handleToggle}>
          {completion?.completed ? "Mark as Incomplete" : "Mark as Complete"}
        </Button>
      </CardFooter>
    </Card>
  );
}
