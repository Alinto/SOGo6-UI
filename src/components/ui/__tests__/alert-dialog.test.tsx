import { render, screen } from '@testing-library/react'

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

describe('AlertDialogContent auto focus', () => {
  it('focuses the first field when the dialog opens', () => {
    render(
      <AlertDialog defaultOpen>
        <AlertDialogContent>
          <AlertDialogTitle>Title</AlertDialogTitle>
          <AlertDialogDescription>Description</AlertDialogDescription>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <input aria-label="first" />
        </AlertDialogContent>
      </AlertDialog>
    )

    expect(screen.getByLabelText('first')).toHaveFocus()
  })

  it('keeps the default focus when there is no field', () => {
    render(
      <AlertDialog defaultOpen>
        <AlertDialogContent>
          <AlertDialogTitle>Title</AlertDialogTitle>
          <AlertDialogDescription>Description</AlertDialogDescription>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
        </AlertDialogContent>
      </AlertDialog>
    )

    expect(screen.getByRole('button', { name: 'Cancel' })).toHaveFocus()
  })

  it('respects an onOpenAutoFocus handler that prevents the default', () => {
    render(
      <AlertDialog defaultOpen>
        <AlertDialogContent onOpenAutoFocus={(event) => event.preventDefault()}>
          <AlertDialogTitle>Title</AlertDialogTitle>
          <AlertDialogDescription>Description</AlertDialogDescription>
          <input aria-label="first" />
        </AlertDialogContent>
      </AlertDialog>
    )

    expect(screen.getByLabelText('first')).not.toHaveFocus()
  })
})
