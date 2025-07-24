import { ViewModes } from "@/shared/schema";
import { ViewMode } from "@/shared/types";

import { Button } from "./ui/button";

interface Props {
  viewMode: ViewMode;
  setViewMode: React.Dispatch<React.SetStateAction<ViewMode>>;
  onAddHabit: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

export function Header({ viewMode, setViewMode, onAddHabit }: Props) {
  const getViewModeButton = (mode: ViewMode, label: string) => (
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
        {getViewModeButton(ViewModes.DAY, "Day")}
        {getViewModeButton(ViewModes.MONTH, "Month")}
        {getViewModeButton(ViewModes.HEATMAP, "Heatmap")}
        {getViewModeButton(ViewModes.LIST, "List")}
        {getViewModeButton(ViewModes.TABLE, "Table")}
        <Button onClick={onAddHabit}>Add Habit</Button>
      </div>
    </div>
  );
}
