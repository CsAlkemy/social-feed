import { useEffect, useRef, useState } from "react";

import { ThumbsUpIcon } from "lucide-react";

import { ReactionType } from "@repo/library";
import { cn } from "@repo/ui";

import { REACTION_BY_TYPE, REACTIONS } from "@/components/feed/reaction-config";

const LONG_PRESS_MS = 350;

export function ReactionControl({
  reaction,
  onReact,
  variant = "post",
}: {
  reaction: ReactionType | null;
  onReact: (reaction: ReactionType | null) => void;
  variant?: "post" | "comment";
}) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const openTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressed = useRef(false);

  const active = reaction ? REACTION_BY_TYPE[reaction] : null;

  const clearTimers = () => {
    if (openTimer.current) clearTimeout(openTimer.current);
    if (closeTimer.current) clearTimeout(closeTimer.current);
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
  };

  const scheduleOpen = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    openTimer.current = setTimeout(() => setOpen(true), 120);
  };

  const scheduleClose = () => {
    if (openTimer.current) clearTimeout(openTimer.current);
    closeTimer.current = setTimeout(() => setOpen(false), 180);
  };

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

  useEffect(() => () => clearTimers(), []);

  const pick = (type: ReactionType) => {
    setOpen(false);
    onReact(type);
  };

  const handleClick = () => {
    if (longPressed.current) {
      longPressed.current = false;
      return;
    }
    setOpen(false);
    onReact(active ? null : ReactionType.LIKE);
  };

  const handlePointerDown = () => {
    longPressed.current = false;
    longPressTimer.current = setTimeout(() => {
      longPressed.current = true;
      setOpen(true);
    }, LONG_PRESS_MS);
  };

  const cancelLongPress = () => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
  };

  const triggerClassName =
    variant === "post"
      ? cn(
          "flex w-full items-center justify-center gap-2 rounded-md py-2 text-sm font-medium transition-colors hover:bg-secondary",
          active ? active.className : "text-muted-foreground",
        )
      : cn(
          "font-medium transition-colors hover:text-foreground",
          active ? active.className : "",
        );

  return (
    <div
      ref={wrapperRef}
      className={cn("relative flex", variant === "post" && "w-full")}
      onMouseEnter={scheduleOpen}
      onMouseLeave={scheduleClose}
    >
      {open ? (
        <div
          onMouseEnter={() => closeTimer.current && clearTimeout(closeTimer.current)}
          onMouseLeave={scheduleClose}
          className="absolute bottom-full left-0 z-30 mb-2 flex items-center gap-0.5 rounded-full border border-border bg-popover p-1 shadow-lg"
        >
          {REACTIONS.map((item) => (
            <button
              key={item.type}
              type="button"
              aria-label={item.label}
              title={item.label}
              onClick={() => pick(item.type)}
              className="grid size-9 place-items-center rounded-full text-xl leading-none transition-transform hover:scale-125"
            >
              <span aria-hidden>{item.emoji}</span>
            </button>
          ))}
        </div>
      ) : null}

      <button
        type="button"
        aria-pressed={Boolean(active)}
        onClick={handleClick}
        onPointerDown={handlePointerDown}
        onPointerUp={cancelLongPress}
        onPointerLeave={cancelLongPress}
        className={triggerClassName}
      >
        {variant === "post" &&
          (active ? (
            <span aria-hidden className="text-base leading-none">
              {active.emoji}
            </span>
          ) : (
            <ThumbsUpIcon className="size-4" />
          ))}
        {active ? active.label : "Like"}
      </button>
    </div>
  );
}
