import { PasswordInput } from '@/components/ui/input-password'
import { Meta, StoryObj } from '@storybook/react'

const meta: Meta = {
  title: 'Components/PasswordInput',
  tags: ['autodocs'],
  component: PasswordInput,
  argTypes: {
    className: { control: 'text' },
    placeholder: { control: 'text' },
  },
  args: {
    className: 'w-full',
    placeholder: 'Enter your password',
  },
} satisfies Meta<typeof PasswordInput>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    className: 'w-full',
    placeholder: 'Enter your password',
  },
}
