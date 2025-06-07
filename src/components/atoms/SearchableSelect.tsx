import type {
  ListBoxItemProps,
  SelectProps,
  ValidationResult,
} from "react-aria-components";
import {
  Button,
  Popover,
  SearchField,
  Select,
  SelectValue,
} from "react-aria-components";
import { tv } from "tailwind-variants";
import { ChevronDown, SearchIcon, XIcon } from "lucide-react";
import { composeTailwindRenderProps, focusRing } from "@/components/utils";
import { Description, FieldError, Label, Input } from "./Field";
import {
  DropdownItem,
  DropdownSection,
  DropdownSectionProps,
  ListBox,
} from "./ListBox";
import { useEffect, useState } from "react";

const styles = tv({
  extend: focusRing,
  base: "flex items-center text-start gap-4 w-full cursor-default border border-black/10 dark:border-white/10 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)] dark:shadow-none rounded-lg pl-3 pr-2 py-2 min-w-[150px] transition bg-slate-50 dark:bg-slate-700",
  variants: {
    isDisabled: {
      false:
        "text-slate-800 dark:text-slate-300 hover:bg-slate-100 pressed:bg-slate-200 dark:hover:bg-slate-600 dark:pressed:bg-slate-500 group-invalid:border-red-600 forced-colors:group-invalid:border-[Mark]",
      true: "text-slate-200 dark:text-slate-600 forced-colors:text-[GrayText] dark:bg-slate-800 dark:border-white/5 forced-colors:border-[GrayText]",
    },
  },
});

export interface SearchableSelectProps<T extends object>
  extends Omit<SelectProps<T>, "children"> {
  label?: string;
  description?: string;
  searchPlaceholder?: string;
  errorMessage?: string | ((validation: ValidationResult) => string);
  items?: Iterable<T>;
  children: React.ReactNode | ((item: T) => React.ReactNode);
  onSearch?: (searchTerm: string) => void;
}

export function SearchableSelect<T extends object>({
  label,
  description,
  errorMessage,
  children,
  items,
  onSearch,
  searchPlaceholder = "Search...",
  ...props
}: SearchableSelectProps<T>) {
  const [searchTerm, setSearchTerm] = useState<string | null>(null);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (onSearch && searchTerm) {
        onSearch(searchTerm);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm, onSearch]);

  return (
    <Select
      {...props}
      placeholder="Select..."
      className={composeTailwindRenderProps(
        props.className,
        "group flex flex-col gap-1 overflow-hidden",
      )}
    >
      {label && <Label>{label}</Label>}
      <Button className={styles}>
        <SelectValue className="flex-1 truncate overflow-hidden text-sm whitespace-nowrap placeholder-shown:italic" />
        <ChevronDown
          aria-hidden
          className="h-4 w-4 text-slate-600 group-disabled:text-slate-200 dark:text-slate-400 dark:group-disabled:text-slate-600 forced-colors:text-[ButtonText] forced-colors:group-disabled:text-[GrayText]"
        />
      </Button>
      {description && <Description>{description}</Description>}
      <FieldError>{errorMessage}</FieldError>
      <Popover className="entering:animate-in entering:fade-in exiting:animate-out exiting:fade-out flex !max-h-80 w-(--trigger-width) flex-col rounded-md bg-white text-base shadow-lg ring-1 ring-black/5">
        <SearchField
          aria-label="Search"
          autoFocus
          className="group m-1 flex items-center rounded-full border-2 border-slate-300 bg-white has-focus:border-green-600 forced-colors:bg-[Field]"
        >
          <SearchIcon
            aria-hidden
            className="ml-2 h-4 w-4 text-slate-600 forced-colors:text-[ButtonText]"
          />
          <Input
            placeholder={searchPlaceholder}
            className="min-w-0 flex-1 border-none bg-white px-2 py-1 font-[inherit] text-base text-slate-800 placeholder-slate-500 outline outline-0 [&::-webkit-search-cancel-button]:hidden"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button className="pressed:bg-black/10 mr-1 flex w-6 items-center justify-center rounded-full border-0 bg-transparent p-1 text-center text-sm text-slate-600 transition group-empty:invisible hover:bg-black/[5%]">
            <XIcon aria-hidden className="h-4 w-4" />
          </Button>
        </SearchField>
        <ListBox
          items={items}
          className="max-h-[inherit] overflow-auto p-1 outline-hidden [clip-path:inset(0_0_0_0_round_.75rem)]"
        >
          {children}
        </ListBox>
      </Popover>
    </Select>
  );
}

export function SelectItem(props: ListBoxItemProps) {
  return <DropdownItem {...props} />;
}

export function SelectSection<T extends object>(
  props: DropdownSectionProps<T>,
) {
  return <DropdownSection {...props} />;
}
