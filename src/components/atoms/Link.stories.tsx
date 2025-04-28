import type { Meta } from "@storybook/react";
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

export const Primary = (args: any) => <Link {...args}>Link</Link>;

Primary.args = {
  href: "/",
  variant: "primary",
};

export const Secondary = (args: any) => <Link {...args}>Link</Link>;

Secondary.args = {
  href: "/",
  variant: "secondary",
};

export const Disabled = (args: any) => <Link {...args}>Link</Link>;

Disabled.args = {
  href: "/",
  isDisabled: true,
};
