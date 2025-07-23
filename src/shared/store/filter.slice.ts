import { FilterSlice, ImmerStateCreator } from "./types";

export const createFilterStore: ImmerStateCreator<FilterSlice> = (set) => ({
  filters: {
    habits: [],
    setHabits: (habits) =>
      set(
        (state) => {
          state.filters.habits = habits;
        },
        undefined,
        "store:filters/setHabits",
      ),
  },
});
