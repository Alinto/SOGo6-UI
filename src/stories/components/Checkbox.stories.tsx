import { Checkbox } from '@/components/ui/checkbox'
import { Meta, StoryObj } from '@storybook/react'

const meta: Meta = {
  title: 'Components/Checkbox',
  component: Checkbox,
  tags: ['autodocs', 'input', 'forms'],
  argTypes: {
    className: { control: 'text' },
    checked: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
  args: {
    className: '',
    checked: false,
    disabled: false,
  },
} satisfies Meta<typeof Checkbox>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    className: '',
    checked: false,
    disabled: false,
  },
}

export const Checked: Story = {
  args: {
    className: '',
    checked: true,
    disabled: false,
  },
}

export const Disabled: Story = {
  args: {
    className: '',
    checked: false,
    disabled: true,
  },
}

export const CheckedDisabled: Story = {
  args: {
    className: '',
    checked: true,
    disabled: true,
  },
}
