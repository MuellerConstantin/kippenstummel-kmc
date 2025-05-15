import type { Meta, StoryFn } from "@storybook/react";
import React from "react";
import { Form } from "react-aria-components";
import { Button } from "@/components/atoms/Button";
import { TextField } from "@/components/atoms/TextField";

const meta: Meta<typeof TextField> = {
  title: "Atoms/TextField",
  component: TextField,
  parameters: {
    layout: "centered",
  },
  args: {
    label: "Name",
  },
};

export default meta;

export const Default: StoryFn<typeof TextField> = (args) => (
  <TextField {...args} />
);

export const WithDescription: StoryFn<typeof TextField> = (args) => (
  <TextField {...args} />
);

WithDescription.args = {
  description: "Lorem ipsum dolor sit amet",
};

export const Errored: StoryFn<typeof TextField> = (args) => (
  <TextField {...args} />
);

Errored.args = {
  isInvalid: true,
  errorMessage: "Error message",
};

export const Validation: StoryFn<typeof TextField> = (args) => (
  <Form className="flex flex-col items-start gap-2">
    <TextField {...args} />
    <Button type="submit" variant="secondary">
      Submit
    </Button>
  </Form>
);

Validation.args = {
  isRequired: true,
};
