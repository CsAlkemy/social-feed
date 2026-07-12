import { useEffect, useRef, useState } from "react";

import { SmileIcon } from "lucide-react";

const EMOJIS = [
  "😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣",
  "🙂", "😉", "😊", "😍", "🥰", "😘", "😎", "🤩",
  "🤔", "🤗", "😏", "😴", "😜", "🤪", "😢", "😭",
  "😤", "😠", "😡", "🥳", "😱", "😳", "🙄", "😬",
  "👍", "👎", "👏", "🙌", "🙏", "💪", "🤝", "✌️",
  "❤️", "🧡", "💛", "💚", "💙", "💜", "🔥", "✨",
  "🎉", "🎂", "🌟", "⭐", "💯", "✅", "👀", "🚀",
];

export function EmojiPicker({
  onSelect,
  className,
}: {
  onSelect: (emoji: string) => void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (event: PointerEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("pointerdown", handler);
    return () => document.removeEventListener("pointerdown", handler);
  }, [open]);

  return (
    <div ref={wrapperRef} className="relative flex">
      <button
        type="button"
        aria-label="Add an emoji"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className={className}
      >
        <SmileIcon className="size-4" />
      </button>

      {open ? (
        <div className="absolute bottom-full right-0 z-30 mb-2 w-64 rounded-lg border border-border bg-popover p-2 shadow-lg">
          <div className="grid max-h-48 grid-cols-8 gap-1 overflow-y-auto">
            {EMOJIS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                aria-label={`Insert ${emoji}`}
                onClick={() => {
                  onSelect(emoji);
                  setOpen(false);
                }}
                className="grid size-7 place-items-center rounded text-lg leading-none hover:bg-secondary"
              >
                <span aria-hidden>{emoji}</span>
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
