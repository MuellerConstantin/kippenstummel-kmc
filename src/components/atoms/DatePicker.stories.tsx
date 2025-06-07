import type { Meta, StoryFn } from "@storybook/react";
import React from "react";
import { Form } from "react-aria-components";
import { Button } from "./Button";
import { DatePicker } from "./DatePicker";

const meta: Meta<typeof DatePicker> = {
  component: DatePicker,
  parameters: {
    layout: "centered",
  },
  args: {
    label: "Event date",
  },
};

export default meta;

export const Default: StoryFn<typeof DatePicker> = (args) => (
  <DatePicker {...args} />
);

export const Validation: StoryFn<typeof DatePicker> = (args) => (
  <Form className="flex flex-col items-start gap-2">
    <DatePicker {...args} />
    <Button type="submit" variant="secondary">
      Submit
    </Button>
  </Form>
);

Validation.args = {
  isRequired: true,
};
