import type { Meta, StoryFn } from "@storybook/react";
import React from "react";
import { Link } from "@/components/atoms/Link";

const meta: Meta<typeof Link> = {
  title: "Atoms/Link",
  component: Link,
  parameters: {
    layout: "centered",
  },
};

export default meta;

export const Primary: StoryFn<typeof Link> = (args) => (
  <Link {...args}>Link</Link>
);

Primary.args = {
  href: "/",
  variant: "primary",
};

export const Secondary: StoryFn<typeof Link> = (args) => (
  <Link {...args}>Link</Link>
);

Secondary.args = {
  href: "/",
  variant: "secondary",
};

export const Disabled: StoryFn<typeof Link> = (args) => (
  <Link {...args}>Link</Link>
);

Disabled.args = {
  href: "/",
  isDisabled: true,
};
