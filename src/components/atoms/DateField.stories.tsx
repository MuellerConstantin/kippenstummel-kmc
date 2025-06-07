import type { Meta, StoryFn } from "@storybook/react";
import React from "react";
import { Form } from "react-aria-components";
import { Button } from "./Button";
import { DateField } from "./DateField";

const meta: Meta<typeof DateField> = {
  component: DateField,
  parameters: {
    layout: "centered",
  },
  args: {
    label: "Event date",
  },
};

export default meta;

export const Example: StoryFn<typeof DateField> = (args) => (
  <DateField {...args} />
);

export const Validation: StoryFn<typeof DateField> = (args) => (
  <Form className="flex flex-col items-start gap-2">
    <DateField {...args} />
    <Button type="submit" variant="secondary">
      Submit
    </Button>
  </Form>
);

Validation.args = {
  isRequired: true,
};
