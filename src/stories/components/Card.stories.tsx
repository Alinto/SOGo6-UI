import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import type { Meta, StoryObj } from '@storybook/react'

const meta: Meta<CardArgs> = {
  title: 'Components/Card',
  component: Card,
  tags: ['autodocs'],
  render: (args) => (
    <Card {...args}>
      <CardHeader className={args.headerClassName}>
        <CardTitle>{args.title}</CardTitle>
        <CardDescription>{args.description}</CardDescription>
      </CardHeader>
      <CardContent className={args.contentClassName}>
        <p>{args.content}</p>
      </CardContent>
      <CardFooter className={args.footerClassName}>Footer</CardFooter>
    </Card>
  ),
  argTypes: {
    headerClassName: {
      control: 'text',
    },
    contentClassName: { control: 'text' },
    footerClassName: { control: 'text' },
    className: { control: 'text' },
    title: { control: 'text' },
    description: { control: 'text' },
    content: { control: 'text' },
  },
  args: {
    headerClassName: '',
    contentClassName: '',
    footerClassName: '',
    className: 'w-96',
    title: 'Card title',
    description: 'lorem ipsum dolor sit amet consectetur adipiscing elit.',
    content:
      'lorem ipsum dolor sit amet consectetur adipiscing elit lorem ipsum dolor sit amet consectetur adipiscing elit.',
  },
} satisfies Meta<typeof Card>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    headerClassName: '',
    contentClassName: '',
    footerClassName: '',
    className: 'w-96',
  },
}
