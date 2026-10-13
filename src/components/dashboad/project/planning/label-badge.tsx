import { labelStyle } from "@/lib/planning";
import { cn } from "@/lib/utils";

export function LabelBadge({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <span
      style={labelStyle(label)}
      className={cn(
        "inline-flex h-5 items-center gap-1 rounded-md border px-1.5 text-[11px] font-medium",
        className
      )}
    >
      {children ?? label}
    </span>
  );
}
