import { CalendarGrid } from "./CalendarGrid";
import { CalendarHeader } from "./CalendarHeader";
import { MetadataDialog } from "../../components/MetadataDialog";

export function HabitCalendar() {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <MetadataDialog />
      <CalendarHeader />
      <CalendarGrid />
    </div>
  );
}
