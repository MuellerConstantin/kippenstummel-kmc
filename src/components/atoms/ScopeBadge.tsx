import { Filter } from "lucide-react";

export interface ScopeBadgeProps {
  label: string;
  filtered?: boolean;
}

export function ScopeBadge({ label, filtered }: ScopeBadgeProps) {
  const className = filtered
    ? "inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
    : "inline-flex shrink-0 items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300";

  return (
    <span className={className}>
      {filtered && <Filter className="h-3 w-3" />}
      {label}
    </span>
  );
}
