import type { Meta, StoryObj } from "@storybook/react";
import { Form } from "react-aria-components";
import { Button } from "./Button";
import { Checkbox, CheckboxGroup } from "./Checkbox";

const meta: Meta<typeof CheckboxGroup> = {
  title: "CheckboxGroup",
  component: CheckboxGroup,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {},
  args: {
    label: "Cities",
    isDisabled: false,
    isRequired: false,
    description: "",
    children: (
      <>
        <Checkbox value="sf">San Francisco</Checkbox>
        <Checkbox value="ny">New York</Checkbox>
        <Checkbox value="sydney">Sydney</Checkbox>
        <Checkbox value="london">London</Checkbox>
        <Checkbox value="tokyo">Tokyo</Checkbox>
      </>
    ),
  },
};

export default meta;

export const Default = {
  args: {},
};

export const Validation: StoryObj<typeof CheckboxGroup> = {
  render: (args) => (
    <Form className="flex flex-col items-start gap-2">
      <CheckboxGroup {...args} />
      <Button type="submit" variant="secondary">
        Submit
      </Button>
    </Form>
  ),
};

Validation.args = {
  isRequired: true,
};
