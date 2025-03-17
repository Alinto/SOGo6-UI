import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { FormProvider, useForm } from 'react-hook-form'
import {
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../form'

describe('Form components', () => {
  const Wrapper = ({ children }) => {
    const methods = useForm()
    return <FormProvider {...methods}>{children}</FormProvider>
  }
  it('matches the snapshot', () => {
    const { asFragment } = render(
      <Wrapper>
        <FormItem />
        <FormLabel>Label</FormLabel>
        <FormDescription>Description</FormDescription>
        <FormMessage>Message</FormMessage>
      </Wrapper>
    )
    expect(asFragment()).toMatchSnapshot()
  })
  it('renders FormItem component', () => {
    const { container } = render(
      <Wrapper>
        <FormItem />
      </Wrapper>
    )
    expect(container.firstChild).toHaveClass('space-y-2')
  })

  it('renders FormLabel component', () => {
    render(
      <Wrapper>
        <FormField
          name="test"
          render={({ field }) => <FormLabel>Label</FormLabel>}
        ></FormField>
      </Wrapper>
    )
    expect(screen.getByText('Label')).toBeInTheDocument()
  })

  it('renders FormDescription component', () => {
    render(
      <Wrapper>
        <FormField
          name="test"
          render={() => <FormDescription>Description</FormDescription>}
        />
      </Wrapper>
    )
    expect(screen.getByText('Description')).toBeInTheDocument()
  })

  it('renders FormMessage component', () => {
    render(
      <Wrapper>
        <FormField
          name="test"
          render={() => <FormMessage>Message</FormMessage>}
        />
      </Wrapper>
    )
    expect(screen.getByText('Message')).toBeInTheDocument()
  })

  it('applies custom className to FormItem component', () => {
    const { container } = render(
      <Wrapper>
        <FormItem className="custom-class" />
      </Wrapper>
    )
    expect(container.firstChild).toHaveClass('custom-class')
  })

  it('applies custom className to FormLabel component', () => {
    render(
      <Wrapper>
        <FormField
          name="test"
          render={() => <FormLabel className="custom-class">Label</FormLabel>}
        />
      </Wrapper>
    )
    expect(screen.getByText('Label')).toHaveClass('custom-class')
  })

  it('applies custom className to FormDescription component', () => {
    render(
      <Wrapper>
        <FormField
          name="test"
          render={() => (
            <FormDescription className="custom-class">
              Description
            </FormDescription>
          )}
        />
      </Wrapper>
    )
    expect(screen.getByText('Description')).toHaveClass('custom-class')
  })

  it('applies custom className to FormMessage component', () => {
    render(
      <Wrapper>
        <FormField
          name="test"
          render={() => (
            <FormMessage className="custom-class">Message</FormMessage>
          )}
        />
      </Wrapper>
    )
    expect(screen.getByText('Message')).toHaveClass('custom-class')
  })
})
