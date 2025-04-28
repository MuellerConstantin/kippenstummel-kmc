import type { Meta } from "@storybook/react";
import React from "react";
import { StoreProvider } from "@/store";
import { Navbar } from "./Navbar";

const meta: Meta<typeof Navbar> = {
  title: "Organisms/Navbar",
  decorators: [(story) => <StoreProvider>{story()}</StoreProvider>],
};

export default meta;

export const Default = (args: any) => <Navbar {...args} />;

Default.args = {};
