import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { VirtualFolderEmptyState } from '../virtual-folder-empty-state'

jest.mock('next-intl', () => ({
  useTranslations: jest.fn(() => (key: string) => key),
}))

describe('VirtualFolderEmptyState', () => {
  it('renders title and description translation keys', () => {
    render(<VirtualFolderEmptyState />)
    expect(screen.getByText('title.string')).toBeInTheDocument()
    expect(screen.getByText('description.string')).toBeInTheDocument()
  })
})
