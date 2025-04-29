import type { Meta, StoryFn } from "@storybook/react";
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

export const Default: StoryFn<typeof Switch> = (args) => (
  <Switch {...args}>Option</Switch>
);
