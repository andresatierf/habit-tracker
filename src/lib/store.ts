import { Temporal } from "@js-temporal/polyfill";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

import { Doc, Id } from "../../convex/_generated/dataModel";

type CompletionMetadata = Pick<
  Doc<"completions">,
  "date" | "habitId" | "completed"
> & {
  metadataSchema: Doc<"habits">["metadata"];
  existingMetadata: Doc<"completions">["metadata"];
};

interface State {
  date: Temporal.PlainDate;
  habit: Doc<"habits"> | null;
  completionMetadata: CompletionMetadata | null;
  filters: {
    habits: Id<"habits">[];
  };
}

interface Actions {
  setFilterHabits: (habits: Id<"habits">[]) => void;
  setHabit: (habit: Doc<"habits"> | null) => void;
  setCompletionMetadata: (
    completionMetadata: CompletionMetadata | null,
  ) => void;
  setDate: (date: Temporal.PlainDate) => void;
}

export const useStore = create<State & Actions>()(
  immer((set) => ({
    date: Temporal.Now.plainDateISO(),
    habit: null,
    completionMetadata: null,
    filters: {
      habits: [],
    },
    setDate: (date) =>
      set((state) => {
        state.date = date;
      }),
    setHabit: (habit) =>
      set((state) => {
        state.habit = habit;
      }),
    setCompletionMetadata: (completionMetadata) =>
      set((state) => {
        state.completionMetadata = completionMetadata;
      }),
    setFilterHabits: (habits) =>
      set((state) => {
        state.filters.habits = habits;
      }),
  })),
);
