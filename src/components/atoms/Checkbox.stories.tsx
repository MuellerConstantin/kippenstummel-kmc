import type { Meta } from "@storybook/react";
import { Checkbox } from "./Checkbox";

const meta: Meta<typeof Checkbox> = {
  title: "Checkbox",
  component: Checkbox,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {},
  args: {
    isDisabled: false,
    children: "Checkbox",
  },
};

export default meta;

export const Default = {
  args: {},
};
