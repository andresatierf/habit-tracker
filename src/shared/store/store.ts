import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

import { createCalendarStore } from "./calendar.slice";
import { createCompletionStore } from "./completion.slice";
import { createFilterStore } from "./filter.slice";
import { Store } from "./types";

export const useStore = create<Store>()(
  devtools(
    persist(
      immer((...a) => ({
        ...createFilterStore(...a),
        ...createCompletionStore(...a),
        ...createCalendarStore(...a),
      })),
      {
        name: "habit-tracker",
      },
    ),
  ),
);
