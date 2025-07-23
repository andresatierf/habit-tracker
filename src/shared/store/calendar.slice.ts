import { Temporal } from "@js-temporal/polyfill";

import { CalendarSlice, ImmerStateCreator } from "./types";

export const createCalendarStore: ImmerStateCreator<CalendarSlice> = (set) => ({
  calendar: {
    date: Temporal.Now.plainDateISO(),
    setDate: (date) =>
      set(
        (state) => {
          state.calendar.date = date;
        },
        undefined,
        "store:calendar/setDate",
      ),
  },
});
