import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { Spinner } from "@/components/atoms/Spinner";

const meta: Meta<typeof Spinner> = {
  title: "Atoms/Spinner",
  component: Spinner,
  parameters: {
    layout: "centered",
  },
};

export default meta;

export const Default: StoryObj<typeof Spinner> = {
  render: () => <Spinner />,
};

Default.args = {};

export const Small: StoryObj<typeof Spinner> = {
  render: () => <Spinner />,
};

Small.args = { size: 12 };

export const Large: StoryObj<typeof Spinner> = {
  render: () => <Spinner />,
};

Large.args = { size: 36 };
