import { Button } from "../ui/button";
import {
  EmojiPicker,
  EmojiPickerContent,
  EmojiPickerSearch,
} from "../ui/emoji-picker";
import { Label } from "../ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

// prettier-ignore
const ICONS = [
  "💪", "🏃", "📚", "💧",
  "🧘", "🎯", "✍️", "🎵",
  "🎨", "🍎", "🌱", "💤",
  "🧹", "💰", "📱", "🚫",
  "⏰", "🔥", "⭐", "🎉",
];

interface Props {
  icon: string;
  setIcon: React.Dispatch<React.SetStateAction<string>>;
}

export function IconInput({ icon, setIcon }: Props) {
  return (
    <div>
      <Label>Icon</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="icon" className="font-normal">
            <span className="text-lg">{icon}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="h-96 w-auto border-0 p-4">
          <EmojiPicker
            onEmojiSelect={(emoji) => setIcon(emoji.emoji)}
            // icons={ICONS}
          >
            <div className="flex items-center border-b px-3">
              <EmojiPickerSearch />
            </div>
            <EmojiPickerContent />
          </EmojiPicker>
        </PopoverContent>
      </Popover>
    </div>
  );
}
