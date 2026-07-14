import { cn } from "@repo/ui";

export function LoadMoreButton({
  loading,
  onClick,
  className,
  children = "Load more",
}: {
  loading: boolean;
  onClick: () => void;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      disabled={loading}
      onClick={onClick}
      className={cn("font-medium text-primary", className)}
    >
      {loading ? "Loading…" : children}
    </button>
  );
}
