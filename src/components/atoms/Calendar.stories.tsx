import React from "react";
import { Calendar } from "./Calendar";

import type { Meta, StoryFn } from "@storybook/react";

const meta: Meta<typeof Calendar> = {
  component: Calendar,
  parameters: {
    layout: "centered",
  },
};

export default meta;

export const Example: StoryFn<typeof Calendar> = (args) => (
  <Calendar aria-label="Event date" {...args} />
);
