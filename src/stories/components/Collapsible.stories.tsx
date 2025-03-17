import { Button } from '@/components/ui/button'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Meta, StoryObj } from '@storybook/react'

const meta: Meta = {
  title: 'Components/Collapsible',
  tags: ['autodocs'],
  component: Collapsible,
  argTypes: {
    className: { control: 'text' },
    open: { control: 'boolean' },
  },
  args: {
    className: '',
    open: false,
  },
} satisfies Meta<typeof Collapsible>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => (
    <Collapsible {...args}>
      <CollapsibleTrigger asChild>
        <Button>{args.open ? 'Collapse' : 'Expand'}</Button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <p>This is the collapsible content.</p>
      </CollapsibleContent>
    </Collapsible>
  ),
  args: {
    className: '',
    open: false,
  },
}

export const Open: Story = {
  render: (args) => (
    <Collapsible {...args}>
      <CollapsibleTrigger asChild>
        <Button>{args.open ? 'Collapse' : 'Expand'}</Button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <p>This is the collapsible content.</p>
      </CollapsibleContent>
    </Collapsible>
  ),
  args: {
    className: '',
    open: true,
  },
}
