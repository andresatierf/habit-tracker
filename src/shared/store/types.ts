import { Temporal } from "@js-temporal/polyfill";
import { StateCreator } from "zustand";

import { Doc, Id } from "../../../convex/_generated/dataModel";

export interface FilterSlice {
  filters: {
    habits: Id<"habits">[];
    setHabits: (habits: Id<"habits">[]) => void;
  };
}

type CompletionMetadata = Pick<
  Doc<"completions">,
  "date" | "habitId" | "completed"
> & {
  schema: Doc<"habits">["metadata"];
  initial: Doc<"completions">["metadata"];
};

export interface CompletionSlice {
  completion: {
    metadata: CompletionMetadata | null;
    setMetadata: (metadata: CompletionMetadata | null) => void;
  };
}

export interface CalendarSlice {
  calendar: {
    date: Temporal.PlainDate;
    setDate: (date: Temporal.PlainDate) => void;
  };
}

export interface Store extends FilterSlice, CompletionSlice, CalendarSlice {}

export type ImmerStateCreator<T> = StateCreator<
  Store,
  [["zustand/immer", never], never],
  [],
  T
>;
