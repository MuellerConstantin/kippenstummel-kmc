import type { Meta } from "@storybook/react";
import React from "react";
import { ListBox, ListBoxItem } from "@/components/atoms/ListBox";

const meta: Meta<typeof ListBox> = {
  title: "Atoms/ListBox",
  component: ListBox,
  parameters: {
    layout: "centered",
  },
};

export default meta;

export const Default = (args: any) => (
  <ListBox aria-label="Items" {...args}>
    <ListBoxItem id="item-1">Item 1</ListBoxItem>
    <ListBoxItem id="item-2">Item 2</ListBoxItem>
    <ListBoxItem id="item-3">Item 3</ListBoxItem>
    <ListBoxItem id="item-4">Item 4</ListBoxItem>
  </ListBox>
);

Default.args = {
  onAction: null,
  selectionMode: "single",
};

export const MultipleItems = (args: any) => <Default {...args} />;

MultipleItems.args = {
  ...Default.args,
  selectionMode: "multiple",
};

export const FixedWidth = (args: any) => <Default {...args} />;

FixedWidth.args = {
  ...Default.args,
  className: "w-[200px]",
};

export const DisabledItems = (args: any) => <Default {...args} />;

DisabledItems.args = {
  ...Default.args,
  disabledKeys: ["item-2"],
};
