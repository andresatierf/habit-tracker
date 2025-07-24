import { Input } from "../ui/input";
import { Label } from "../ui/label";

interface Props {
  className: HTMLDivElement["className"];
  name: string;
  setName: React.Dispatch<React.SetStateAction<string>>;
}

export function NameInput({ className, name, setName }: Props) {
  return (
    <div className={className}>
      <Label htmlFor="habit-name">Habit Name</Label>
      <Input
        id="habit-name"
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Enter habit name..."
        required
      />
    </div>
  );
}
