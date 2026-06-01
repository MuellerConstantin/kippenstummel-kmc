import type { ScopeBadgeProps } from "@/components/atoms/ScopeBadge";

export const filteredScope = (lastNDays: number): ScopeBadgeProps => ({
  label: lastNDays === 1 ? "Last 24 hours" : `Last ${lastNDays} days`,
  filtered: true,
});

export const fixedScope = (label: string): ScopeBadgeProps => ({
  label,
  filtered: false,
});
