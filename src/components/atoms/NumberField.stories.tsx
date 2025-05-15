import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { Form } from "react-aria-components";
import { Button } from "./Button";
import { NumberField } from "./NumberField";

const meta: Meta<typeof NumberField> = {
  component: NumberField,
  parameters: {
    layout: "centered",
  },
  args: {
    label: "Cookies",
  },
};

export default meta;

export const Default: StoryObj<typeof NumberField> = {
  render: (args) => <NumberField {...args} />,
};

export const Validation: StoryObj<typeof NumberField> = {
  render: (args) => (
    <Form className="flex flex-col items-start gap-2">
      <NumberField {...args} />
      <Button type="submit" variant="secondary">
        Submit
      </Button>
    </Form>
  ),
};

Validation.args = {
  isRequired: true,
};
