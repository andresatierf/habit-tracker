import { Button } from "@/components/button";
import { Temporal } from "@js-temporal/polyfill";
import React from "react";

interface CalendarHeaderProps {
  currentDate: Temporal.PlainDate;
  navigateMonth: (direction: "prev" | "next") => void;
  setCurrentDate: React.Dispatch<React.SetStateAction<Temporal.PlainDate>>;
}

export function CalendarHeader({
  currentDate,
  navigateMonth,
  setCurrentDate,
}: CalendarHeaderProps) {
  return (
    <div className="mb-6 flex items-center justify-between">
      <h2 className="text-xl font-semibold text-gray-900">
        {currentDate.toLocaleString("en-US", {
          month: "long",
          year: "numeric",
        })}
      </h2>
      <div className="flex gap-2">
        <Button onClick={() => navigateMonth("prev")} variant="outline">
          ←
        </Button>
        <Button
          onClick={() => setCurrentDate(Temporal.Now.plainDateISO())}
          variant="outline"
        >
          Today
        </Button>
        <Button onClick={() => navigateMonth("next")} variant="outline">
          →
        </Button>
      </div>
    </div>
  );
}
