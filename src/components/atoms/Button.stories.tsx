import { Button } from "@/components/atoms/Button";
import { Info } from "lucide-react";

export default {
  title: "Atoms/Button",
  component: Button,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["primary", "secondary", "icon"],
    },
  },
  args: {
    isDisabled: false,
    children: "Button",
  },
};

export const Primary = {
  args: {
    variant: "primary",
  },
};

export const Secondary = {
  args: {
    variant: "secondary",
  },
};

export const Icon = (args: any) => (
  <Button {...args}>
    <Info className="h-6 w-6" />
  </Button>
);

Icon.args = {
  ...Primary.args,
  variant: "icon",
};
