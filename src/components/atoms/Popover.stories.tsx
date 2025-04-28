import type { Meta } from "@storybook/react";
import { HelpCircle } from "lucide-react";
import React from "react";
import { DialogTrigger, Heading } from "react-aria-components";
import { Button } from "@/components/atoms/Button";
import { Dialog } from "@/components/atoms/Dialog";
import { Popover } from "@/components/atoms/Popover";

const meta: Meta<typeof Popover> = {
  title: "Atoms/Popover",
  component: Popover,
  parameters: {
    layout: "centered",
  },
  args: {
    showArrow: true,
  },
};

export default meta;

export const Default = (args: any) => (
  <DialogTrigger>
    <Button variant="icon" aria-label="Help">
      <HelpCircle className="h-4 w-4" />
    </Button>
    <Popover {...args} className="max-w-[250px]">
      <Dialog>
        <Heading slot="title" className="mb-2 text-lg font-semibold">
          Help
        </Heading>
        <p className="text-sm">
          For help accessing your account, please contact support.
        </p>
      </Dialog>
    </Popover>
  </DialogTrigger>
);
