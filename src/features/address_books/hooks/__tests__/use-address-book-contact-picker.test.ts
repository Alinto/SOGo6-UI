import '@testing-library/jest-dom'
import { renderHook } from '@testing-library/react'
import { skipToken } from '@reduxjs/toolkit/query'

const mockUseGetAddressBookContactPickerQuery = jest.fn()

jest.mock('../../store/address-books-api', () => ({
  useGetAddressBookContactPickerQuery: (arg: unknown) =>
    mockUseGetAddressBookContactPickerQuery(arg),
}))

import { useAddressBookContactPicker } from '../use-address-book-contact-picker'

const sampleContacts = [
  { id: 'c1', version: '4.0', firstName: 'Alice', lastName: 'Martin' },
  { id: 'c2', version: '4.0', firstName: 'Bob', lastName: 'Smith' },
]

describe('useAddressBookContactPicker', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseGetAddressBookContactPickerQuery.mockReturnValue({
      data: sampleContacts,
      isLoading: false,
      isFetching: false,
    })
  })

  describe('basic rendering', () => {
    it('returns contacts from query data', () => {
      const { result } = renderHook(() => useAddressBookContactPicker('work'))

      expect(result.current.contacts).toHaveLength(2)
      expect(result.current.contacts[0].id).toBe('c1')
      expect(result.current.contacts[1].firstName).toBe('Bob')
    })

    it('returns empty contacts when query data is undefined', () => {
      mockUseGetAddressBookContactPickerQuery.mockReturnValue({
        data: undefined,
        isLoading: false,
        isFetching: false,
      })

      const { result } = renderHook(() => useAddressBookContactPicker('work'))

      expect(result.current.contacts).toEqual([])
    })
  })

  describe('configuration', () => {
    it('passes bookId to the contact picker query', () => {
      renderHook(() => useAddressBookContactPicker('personal-1'))

      expect(mockUseGetAddressBookContactPickerQuery).toHaveBeenCalledWith(
        'personal-1'
      )
    })

    it('uses skipToken when bookId is null', () => {
      renderHook(() => useAddressBookContactPicker(null))

      expect(mockUseGetAddressBookContactPickerQuery).toHaveBeenCalledWith(
        skipToken
      )
    })

    it('uses skipToken when bookId is undefined', () => {
      renderHook(() => useAddressBookContactPicker(undefined))

      expect(mockUseGetAddressBookContactPickerQuery).toHaveBeenCalledWith(
        skipToken
      )
    })
  })

  describe('integration', () => {
    it('exposes loading flags from the query', () => {
      mockUseGetAddressBookContactPickerQuery.mockReturnValue({
        data: sampleContacts,
        isLoading: true,
        isFetching: true,
      })

      const { result } = renderHook(() => useAddressBookContactPicker('work'))

      expect(result.current.isLoading).toBe(true)
      expect(result.current.isFetching).toBe(true)
    })
  })

  describe('component stability', () => {
    it('returns consistent contacts across re-renders with the same bookId', () => {
      const { result, rerender } = renderHook(
        ({ bookId }: { bookId: string }) => useAddressBookContactPicker(bookId),
        { initialProps: { bookId: 'work' } }
      )

      const firstContacts = result.current.contacts
      rerender({ bookId: 'work' })

      expect(result.current.contacts).toBe(firstContacts)
      expect(mockUseGetAddressBookContactPickerQuery).toHaveBeenCalledTimes(2)
    })
  })
})
