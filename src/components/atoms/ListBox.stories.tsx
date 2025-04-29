import type { Meta, StoryFn } from "@storybook/react";
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

export const Default: StoryFn<typeof ListBox> = (args) => (
  <ListBox aria-label="Items" {...args}>
    <ListBoxItem id="item-1">Item 1</ListBoxItem>
    <ListBoxItem id="item-2">Item 2</ListBoxItem>
    <ListBoxItem id="item-3">Item 3</ListBoxItem>
    <ListBoxItem id="item-4">Item 4</ListBoxItem>
  </ListBox>
);

Default.args = {
  selectionMode: "single",
};

export const MultipleItems: StoryFn<typeof ListBox> = (args) => (
  <ListBox aria-label="Items" {...args}>
    <ListBoxItem id="item-1">Item 1</ListBoxItem>
    <ListBoxItem id="item-2">Item 2</ListBoxItem>
    <ListBoxItem id="item-3">Item 3</ListBoxItem>
    <ListBoxItem id="item-4">Item 4</ListBoxItem>
  </ListBox>
);

MultipleItems.args = {
  ...Default.args,
  selectionMode: "multiple",
};

export const FixedWidth: StoryFn<typeof ListBox> = (args) => (
  <ListBox aria-label="Items" {...args}>
    <ListBoxItem id="item-1">Item 1</ListBoxItem>
    <ListBoxItem id="item-2">Item 2</ListBoxItem>
    <ListBoxItem id="item-3">Item 3</ListBoxItem>
    <ListBoxItem id="item-4">Item 4</ListBoxItem>
  </ListBox>
);

FixedWidth.args = {
  ...Default.args,
  className: "w-[200px]",
};

export const DisabledItems: StoryFn<typeof ListBox> = (args) => (
  <ListBox aria-label="Items" {...args}>
    <ListBoxItem id="item-1">Item 1</ListBoxItem>
    <ListBoxItem id="item-2">Item 2</ListBoxItem>
    <ListBoxItem id="item-3">Item 3</ListBoxItem>
    <ListBoxItem id="item-4">Item 4</ListBoxItem>
  </ListBox>
);

DisabledItems.args = {
  ...Default.args,
  disabledKeys: ["item-2"],
};
