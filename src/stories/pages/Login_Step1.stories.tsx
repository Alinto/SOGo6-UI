import React from "react";
import { Meta, StoryObj } from "@storybook/react";
import LoginLayout from "@/app/(auth)/login/layout";
import { LoginForm } from "@/components/ui/forms/login-form";

const meta = {
  title: "Page/Login_Step1",
  tags: ["autodocs"],
  component: LoginLayout,
  argTypes: {
    children: { control: "text" },
  },
} satisfies Meta<typeof LoginForm>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: <LoginForm />,
  },
};
