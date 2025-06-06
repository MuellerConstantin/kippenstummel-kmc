import type { Meta, StoryObj } from "@storybook/react";
import { SearchField } from "@/components/atoms/SearchField";

const meta: Meta<typeof SearchField> = {
  title: "Atoms/SearchField",
  component: SearchField,
  parameters: {
    layout: "centered",
  },
  args: {
    label: "Search",
  },
};

export default meta;

export const Default: StoryObj<typeof SearchField> = {
  args: {},
};
