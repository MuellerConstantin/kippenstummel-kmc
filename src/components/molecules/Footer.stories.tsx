import type { Meta, StoryFn } from "@storybook/react";
import React from "react";
import { Footer } from "./Footer";

const meta: Meta<typeof Footer> = {
  title: "Molecules/Footer",
  component: Footer,
};

export default meta;

export const Default: StoryFn<typeof Footer> = () => <Footer />;
