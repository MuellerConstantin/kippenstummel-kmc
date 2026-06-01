import type { ScopeBadgeProps } from "@/components/atoms/ScopeBadge";

export const filteredScope = (lastNDays: number): ScopeBadgeProps => ({
  label: `Last ${lastNDays} days`,
  filtered: true,
});

export const fixedScope = (label: string): ScopeBadgeProps => ({
  label,
  filtered: false,
});
