import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";

import { Button } from "@/components/ui/button";

const meta = {
  title: "Components/Button",
  component: Button,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: {
        type: "select",
      },
      options: [
        "default",
        "destructive",
        "outline",
        "secondary",
        "ghost",
        "link",
      ],
    },
    children: {
      control: "text",
    },
    size: {
      type: "string",
      control: {
        type: "select",
      },
      options: ["default", "sm", "lg", "icon"],
    },
    asChild: {
      control: "boolean",
    },
    disabled: {
      type: "boolean",
      control: "boolean",
    },
  },
  args: {
    onClick: fn(),
    children: "Button",
    size: "default",
    asChild: false,
    disabled: false,
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    variant: "default",
  },
};

export const Destructive: Story = {
  args: {
    variant: "destructive",
  },
};

export const Outline: Story = {
  args: {
    variant: "outline",
  },
};

export const Secondary: Story = {
  args: {
    variant: "secondary",
  },
};

export const Ghost: Story = {
  args: {
    variant: "ghost",
  },
};

export const Link: Story = {
  args: {
    variant: "link",
  },
};

export const SM: Story = {
  name: "Small",
  args: {
    size: "sm",
    variant: "default",
  },
};

export const LG: Story = {
  name: "Large",
  args: {
    size: "lg",
    variant: "default",
  },
};

export const I: Story = {
  name: "Icon",
  args: {
    children: "🚀",
    size: "icon",
    variant: "default",
  },
};
