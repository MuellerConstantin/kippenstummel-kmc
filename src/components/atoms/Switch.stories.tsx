import type { Meta } from "@storybook/react";
import React from "react";
import { Switch } from "@/components/atoms/Switch";

const meta: Meta<typeof Switch> = {
  title: "Atoms/Switch",
  component: Switch,
  parameters: {
    layout: "centered",
  },
};

export default meta;

export const Default = (args: any) => <Switch {...args}>Option</Switch>;
