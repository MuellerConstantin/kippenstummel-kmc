import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { Button } from "@/components/atoms/Button";
import { Form } from "@/components/atoms/Form";
import { TextField } from "@/components/atoms/TextField";

const meta: Meta<typeof Form> = {
  title: "Atoms/Form",
  component: Form,
  parameters: {
    layout: "centered",
  },
};

export default meta;

export const Default: StoryObj<typeof Form> = {
  render: (args) => (
    <Form {...args}>
      <TextField label="Email" name="email" type="email" isRequired />
      <div className="flex gap-2">
        <Button type="submit">Submit</Button>
        <Button type="reset" variant="secondary">
          Reset
        </Button>
      </div>
    </Form>
  ),
};
