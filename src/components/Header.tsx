import { Button } from "./ui/button";

export function Header({ viewMode, setViewMode, onAddHabit }) {
  const getViewModeButton = (
    mode: "calendar" | "list" | "table" | "heatmap",
    label: string,
  ) => (
    <Button
      variant={viewMode === mode ? "default" : "secondary"}
      onClick={() => setViewMode(mode)}
    >
      {label}
    </Button>
  );

  return (
    <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
      <h1 className="text-3xl font-bold text-gray-900">My Habits</h1>
      <div className="flex flex-wrap gap-2">
        {getViewModeButton("calendar", "Calendar")}
        {getViewModeButton("heatmap", "Heatmap")}
        {getViewModeButton("list", "List")}
        {getViewModeButton("table", "Table")}
        <Button onClick={onAddHabit}>Add Habit</Button>
      </div>
    </div>
  );
}
