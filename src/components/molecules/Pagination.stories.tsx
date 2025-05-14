import type { Meta, StoryObj } from "@storybook/react";
import { Pagination } from "./Pagination";

const meta: Meta<typeof Pagination> = {
  title: "Molecules/Pagination",
  component: Pagination,
};

export default meta;

export const Default: StoryObj<typeof Pagination> = {
  args: {
    totalPages: 10,
    currentPage: 1,
  },
};

export const Small: StoryObj<typeof Pagination> = {
  args: {
    totalPages: 10,
    currentPage: 10,
    size: "sm",
  },
};

export const Medium: StoryObj<typeof Pagination> = {
  args: {
    totalPages: 10,
    currentPage: 3,
    size: "md",
  },
};

export const Large: StoryObj<typeof Pagination> = {
  args: {
    totalPages: 10,
    currentPage: 7,
    size: "lg",
  },
};
