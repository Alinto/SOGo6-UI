import { Calendar } from '@/components/ui/calendar'
import { Card } from '@/components/ui/card'
import type { Meta, StoryObj } from '@storybook/react'
import { DayPicker } from 'react-day-picker'

export type CalendarProps = React.ComponentProps<typeof DayPicker>

const meta: Meta<CalendarProps> = {
  title: 'Components/Calendar',
  component: Calendar,
  tags: ['autodocs'],
  argTypes: {
    className: { control: 'text' },
    mode: {
      control: { type: 'select', options: ['range', 'multiple', 'single'] },
    },
    selected: { control: 'object' },
    onSelect: { action: 'selected' },
    min: { control: 'number' },
    max: { control: 'number' },
    required: { control: 'boolean' },
    captionLayout: { control: 'text' },
    classNames: { control: 'object' },
    formatters: { control: 'object' },
    labels: { control: 'object' },
    modifiersClassNames: { control: 'object' },
    modifiers: { control: 'object' },
    numberOfMonths: { control: 'number' },
    styles: { control: 'object' },
    today: { control: 'date' },
  },
} satisfies Meta<typeof Card>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    className: 'w-96',
  },
}

export const RangeMode: Story = {
  args: {
    className: 'w-96',
    mode: 'range',
    selected: undefined,
    min: 1,
    max: 7,
    required: false,
    captionLayout: 'buttons',
    classNames: {},
    formatters: {},
    labels: {},
    modifiersClassNames: {},
    modifiers: {},
    numberOfMonths: 1,
    styles: {},
    today: new Date(),
  },
}

export const MultipleMode: Story = {
  args: {
    className: 'w-96',
    mode: 'multiple',
    selected: undefined,
    min: 1,
    max: 7,
    required: false,
    captionLayout: 'buttons',
    classNames: {},
    formatters: {},
    labels: {},
    modifiersClassNames: {},
    modifiers: {},
    numberOfMonths: 1,
    styles: {},
    today: new Date(),
  },
}

export const SingleMode: Story = {
  args: {
    className: 'w-96',
    mode: 'single',
    selected: undefined,
    required: false,
    captionLayout: 'buttons',
    classNames: {},
    formatters: {},
    labels: {},
    modifiersClassNames: {},
    modifiers: {},
    numberOfMonths: 1,
    styles: {},
    today: new Date(),
  },
}
