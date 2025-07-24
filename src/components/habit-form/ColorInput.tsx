import { Button } from "../ui/button";
import { Label } from "../ui/label";

const COLORS = [
  "#ef4444", // red-500
  "#f97316", // orange-500
  "#f59e0b", // amber-500
  "#eab308", // yellow-500
  "#84cc16", // lime-500
  "#22c55e", // green-500
  "#10b981", // emerald-500
  "#14b8a6", // teal-500
  "#06b6d4", // cyan-500
  "#0ea5e9", // sky-500
  "#3b82f6", // blue-500
  "#6366f1", // indigo-500
  "#8b5cf6", // violet-500
  "#a855f7", // purple-500
  "#d946ef", // fuchsia-500
  "#ec4899", // pink-500
  "#f43f5e", // rose-500
];

interface Props {
  color: string;
  setColor: React.Dispatch<React.SetStateAction<string>>;
}

export function ColorInput({ color, setColor }: Props) {
  return (
    <div>
      <Label>Color</Label>
      <div className="grid grid-cols-8 gap-2">
        {COLORS.map((colorOption) => (
          <Button
            key={colorOption}
            type="button"
            onClick={() => setColor(colorOption)}
            className={`size-8 rounded-full border-2 ${
              color === colorOption ? "border-gray-900" : "border-gray-300"
            }`}
            style={{ backgroundColor: colorOption }}
            variant="outline"
            size="icon"
          />
        ))}
      </div>
    </div>
  );
}
