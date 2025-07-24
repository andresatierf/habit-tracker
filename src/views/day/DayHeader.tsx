import { Temporal } from "@js-temporal/polyfill";

import { Button } from "@/components/ui/button";

import { useStore } from "../../shared/store";

export function DayHeader() {
  const selectedDate = useStore((state) => state.calendar.date);
  const setSelectedDate = useStore((state) => state.calendar.setDate);

  const handlePrevDay = () => {
    setSelectedDate(
      Temporal.PlainDate.from(selectedDate).subtract({ days: 1 }),
    );
  };

  const handleNextDay = () => {
    setSelectedDate(Temporal.PlainDate.from(selectedDate).add({ days: 1 }));
  };

  return (
    <div className="flex items-center justify-between">
      <Button onClick={handlePrevDay}>Previous Day</Button>
      <h2 className="text-lg font-semibold">{selectedDate.toString()}</h2>
      <Button onClick={handleNextDay}>Next Day</Button>
    </div>
  );
}
