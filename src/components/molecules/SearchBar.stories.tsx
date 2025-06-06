import type { Meta, StoryObj } from "@storybook/react";
import { SearchBar } from "./SearchBar";

const meta: Meta<typeof SearchBar> = {
  title: "Molecules/SearchBar",
  component: SearchBar,
  parameters: {
    layout: "centered",
  },
};

export default meta;

export const Default: StoryObj<typeof SearchBar> = {
  args: {
    properties: [
      { label: "Property 1", value: "property-1" },
      { label: "Property 2", value: "property-2" },
      { label: "Property 3", value: "property-3" },
    ],
    onSearch: () => {},
  },
};
