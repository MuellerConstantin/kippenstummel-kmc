import { ArrowUp } from "lucide-react";
import React from "react";
import {
  Cell as AriaCell,
  Column as AriaColumn,
  Row as AriaRow,
  Table as AriaTable,
  TableHeader as AriaTableHeader,
  Button,
  CellProps,
  Collection,
  ColumnProps,
  ColumnResizer,
  Group,
  ResizableTableContainer,
  RowProps,
  TableHeaderProps,
  TableProps,
  composeRenderProps,
  useTableOptions,
} from "react-aria-components";
import { tv } from "tailwind-variants";
import { Checkbox } from "./Checkbox";
import { composeTailwindRenderProps, focusRing } from "@/components/utils";

export function Table(props: TableProps) {
  return (
    <ResizableTableContainer className="relative max-h-[280px] w-[550px] scroll-pt-[2.281rem] overflow-auto rounded-lg border border-gray-200 dark:border-slate-600">
      <AriaTable {...props} className="border-separate border-spacing-0" />
    </ResizableTableContainer>
  );
}

const columnStyles = tv({
  extend: focusRing,
  base: "px-2 h-5 flex-1 flex gap-1 items-center overflow-hidden",
});

const resizerStyles = tv({
  extend: focusRing,
  base: "w-px px-[8px] translate-x-[8px] box-content py-1 h-5 bg-clip-content bg-gray-400 dark:bg-slate-500 forced-colors:bg-[ButtonBorder] cursor-col-resize rounded-xs resizing:bg-green-600 forced-colors:resizing:bg-[Highlight] resizing:w-[2px] resizing:pl-[7px] -outline-offset-2",
});

export function Column(props: ColumnProps) {
  return (
    <AriaColumn
      {...props}
      className={composeTailwindRenderProps(
        props.className,
        "cursor-default text-start text-sm font-semibold text-gray-700 focus-within:z-20 dark:text-slate-300 [&:hover]:z-20",
      )}
    >
      {composeRenderProps(
        props.children,
        (children, { allowsSorting, sortDirection }) => (
          <div className="flex items-center">
            <Group role="presentation" tabIndex={-1} className={columnStyles}>
              <span className="truncate">{children}</span>
              {allowsSorting && (
                <span
                  className={`flex h-4 w-4 items-center justify-center transition ${
                    sortDirection === "descending" ? "rotate-180" : ""
                  }`}
                >
                  {sortDirection && (
                    <ArrowUp
                      aria-hidden
                      className="h-4 w-4 text-gray-500 dark:text-slate-400 forced-colors:text-[ButtonText]"
                    />
                  )}
                </span>
              )}
            </Group>
            {!props.width && <ColumnResizer className={resizerStyles} />}
          </div>
        ),
      )}
    </AriaColumn>
  );
}

export function TableHeader<T extends object>(props: TableHeaderProps<T>) {
  const { selectionBehavior, selectionMode, allowsDragging } =
    useTableOptions();

  return (
    <AriaTableHeader
      {...props}
      className={composeTailwindRenderProps(
        props.className,
        "sticky top-0 z-10 rounded-t-lg border-b border-b-gray-200 bg-gray-100/60 backdrop-blur-md supports-[-moz-appearance:none]:bg-gray-100 dark:border-b-slate-700 dark:bg-slate-700/60 dark:supports-[-moz-appearance:none]:bg-slate-700 forced-colors:bg-[Canvas]",
      )}
    >
      {/* Add extra columns for drag and drop and selection. */}
      {allowsDragging && <Column />}
      {selectionBehavior === "toggle" && (
        <AriaColumn
          width={36}
          minWidth={36}
          className="cursor-default p-2 text-start text-sm font-semibold"
        >
          {selectionMode === "multiple" && <Checkbox slot="selection" />}
        </AriaColumn>
      )}
      <Collection items={props.columns}>{props.children}</Collection>
    </AriaTableHeader>
  );
}

const rowStyles = tv({
  extend: focusRing,
  base: "group/row relative cursor-default select-none -outline-offset-2 text-gray-900 disabled:text-gray-300 dark:text-slate-200 dark:disabled:text-slate-600 text-sm hover:bg-gray-100 dark:hover:bg-slate-700/60 selected:bg-green-100 selected:hover:bg-green-200 dark:selected:bg-green-700/30 dark:selected:hover:bg-green-700/40",
});

export function Row<T extends object>({
  id,
  columns,
  children,
  ...otherProps
}: RowProps<T>) {
  const { selectionBehavior, allowsDragging } = useTableOptions();

  return (
    <AriaRow id={id} {...otherProps} className={rowStyles}>
      {allowsDragging && (
        <Cell>
          <Button slot="drag">≡</Button>
        </Cell>
      )}
      {selectionBehavior === "toggle" && (
        <Cell>
          <Checkbox slot="selection" />
        </Cell>
      )}
      <Collection items={columns}>{children}</Collection>
    </AriaRow>
  );
}

const cellStyles = tv({
  extend: focusRing,
  base: "border-b border-b-gray-200 dark:border-b-slate-700 group-last/row:border-b-0 [--selected-border:var(--color-green-200)] dark:[--selected-border:var(--color-green-900)] group-selected/row:border-(--selected-border) in-[:has(+[data-selected])]:border-(--selected-border) p-2 truncate -outline-offset-2",
});

export function Cell(props: CellProps) {
  return <AriaCell {...props} className={cellStyles} />;
}
