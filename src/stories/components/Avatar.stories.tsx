import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Meta, StoryObj } from '@storybook/react'

const meta: Meta = {
  title: 'Components/Avatar',
  component: Avatar,
  tags: ['autodocs'],
  argTypes: {
    className: { control: 'text' },
    src: { control: 'text' },
    alt: { control: 'text' },
    fallback: { control: 'text' },
  },
  args: {
    className: '',
    src: '',
    alt: 'Avatar',
    fallback: 'AB',
  },
} satisfies Meta<typeof Avatar>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => (
    <Avatar {...args}>
      <AvatarImage src={args.src} alt={args.alt} />
      <AvatarFallback>{args.fallback}</AvatarFallback>
    </Avatar>
  ),
  args: {
    className: '',
    src: '',
    alt: 'Avatar',
    fallback: 'AB',
  },
}

export const WithImage: Story = {
  render: (args) => (
    <Avatar {...args}>
      <AvatarImage src={args.src} alt={args.alt} />
      <AvatarFallback>{args.fallback}</AvatarFallback>
    </Avatar>
  ),
  args: {
    className: '',
    src: 'https://via.placeholder.com/150',
    alt: 'Avatar with Image',
    fallback: 'AB',
  },
}

export const WithFallback: Story = {
  render: (args) => (
    <Avatar {...args}>
      <AvatarImage src={args.src} alt={args.alt} />
      <AvatarFallback>{args.fallback}</AvatarFallback>
    </Avatar>
  ),
  args: {
    className: '',
    src: '',
    alt: 'Avatar with Fallback',
    fallback: 'AB',
  },
}
