import { Meta, StoryObj } from "@storybook/react";
import { LoginForm } from "@/components/ui/forms/login-form";

const meta = {
  title: "Forms/LoginForm_Step1",
  tags: ["autodocs"],
  component: LoginForm,
  argTypes: {
    className: { control: "text" },
  },
} satisfies Meta<typeof LoginForm>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    className: "default",
  },
};
