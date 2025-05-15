import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { Select, SelectItem, SelectSection } from "@/components/atoms/Select";

const meta: Meta<typeof Select> = {
  title: "Atoms/Select",
  component: Select,
  parameters: {
    layout: "centered",
  },
  args: {
    label: "Select item",
  },
};

export default meta;

export const Default: StoryObj<typeof Select> = {
  render: (args) => (
    <Select {...args}>
      <SelectItem id="item-1">Item 1</SelectItem>
      <SelectItem id="item-2">Item 2</SelectItem>
      <SelectItem id="item-3">Item 3</SelectItem>
    </Select>
  ),
};

export const DisabledItems: StoryObj<typeof Select> = {
  args: {
    disabledKeys: ["item-2"],
  },
  render: (args) => (
    <Select {...args}>
      <SelectItem id="item-1">Item 1</SelectItem>
      <SelectItem id="item-2">Item 2</SelectItem>
      <SelectItem id="item-3">Item 3</SelectItem>
    </Select>
  ),
};

export const Sections: StoryObj<typeof Select> = {
  render: (args) => (
    <Select {...args}>
      <SelectSection title="Item Group #1">
        <SelectItem id="item-1">Item 1</SelectItem>
        <SelectItem id="item-2">Item 2</SelectItem>
        <SelectItem id="item-3">Item 3</SelectItem>
      </SelectSection>
      <SelectSection title="Item Group #2">
        <SelectItem id="item-4">Item 4</SelectItem>
        <SelectItem id="item-5">Item 5</SelectItem>
        <SelectItem id="item-6">Item 6</SelectItem>
      </SelectSection>
      <SelectSection title="Item Group #3">
        <SelectItem id="item-4">Item 7</SelectItem>
        <SelectItem id="item-5">Item 8</SelectItem>
        <SelectItem id="item-6">Item 9</SelectItem>
      </SelectSection>
    </Select>
  ),
};
