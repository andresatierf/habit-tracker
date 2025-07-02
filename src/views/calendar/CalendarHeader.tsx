import { Button } from "@/components/button";
import React from "react";

interface CalendarHeaderProps {
  currentDate: Date;
  navigateMonth: (direction: "prev" | "next") => void;
  setCurrentDate: React.Dispatch<React.SetStateAction<Date>>;
}

export function CalendarHeader({
  currentDate,
  navigateMonth,
  setCurrentDate,
}: CalendarHeaderProps) {
  return (
    <div className="mb-6 flex items-center justify-between">
      <h2 className="text-xl font-semibold text-gray-900">
        {currentDate.toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        })}
      </h2>
      <div className="flex gap-2">
        <Button onClick={() => navigateMonth("prev")} variant="outline">
          ←
        </Button>
        <Button onClick={() => setCurrentDate(new Date())} variant="outline">
          Today
        </Button>
        <Button onClick={() => navigateMonth("next")} variant="outline">
          →
        </Button>
      </div>
    </div>
  );
}
