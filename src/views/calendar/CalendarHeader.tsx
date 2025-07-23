import React, { useCallback } from "react";

import { Temporal } from "@js-temporal/polyfill";

import { Button } from "@/components/ui/button";
import { useStore } from "@/shared/store";

export function CalendarHeader() {
  const currentDate = useStore((state) => state.calendar.date);
  const setCurrentDate = useStore((state) => state.calendar.setDate);

  const onNavigate = useCallback(
    (direction: "prev" | "next") => {
      const newDate = Temporal.PlainDate.from(currentDate).add(
        Temporal.Duration.from({ months: direction === "next" ? 1 : -1 }),
      );
      setCurrentDate(newDate);
    },
    [currentDate, setCurrentDate],
  );

  return (
    <div className="mb-6 flex items-center justify-between">
      <h2 className="text-xl font-semibold text-gray-900">
        {currentDate.toLocaleString("en-US", {
          month: "long",
          year: "numeric",
        })}
      </h2>
      <div className="flex gap-2">
        <Button onClick={() => onNavigate("prev")} variant="outline">
          ←
        </Button>
        <Button
          onClick={() => setCurrentDate(Temporal.Now.plainDateISO())}
          variant="outline"
        >
          Today
        </Button>
        <Button onClick={() => onNavigate("next")} variant="outline">
          →
        </Button>
      </div>
    </div>
  );
}
