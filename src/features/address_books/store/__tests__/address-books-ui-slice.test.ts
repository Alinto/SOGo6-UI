import '@testing-library/jest-dom'
import reducer, {
  closeForm,
  closeListForm,
  openCreateForm,
  openCreateListForm,
  openEditForm,
  openEditListForm,
  setSearchQuery,
  toggleSortOrder,
} from '../address-books-ui-slice'

describe('addressBooksUiSlice', () => {
  describe('initial state', () => {
    it('has default values', () => {
      const state = reducer(undefined, { type: '@@INIT' })
      expect(state.isFormOpen).toBe(false)
      expect(state.searchQuery).toBe('')
      expect(state.sortOrder).toBe('asc')
    })
  })

  describe('setSearchQuery', () => {
    it('updates search query', () => {
      const state = reducer(undefined, setSearchQuery('alice'))
      expect(state.searchQuery).toBe('alice')
    })
  })

  describe('toggleSortOrder', () => {
    it('toggles between asc and desc', () => {
      let state = reducer(undefined, toggleSortOrder())
      expect(state.sortOrder).toBe('desc')
      state = reducer(state, toggleSortOrder())
      expect(state.sortOrder).toBe('asc')
    })
  })

  describe('form actions', () => {
    it('openCreateForm opens form with optional prefill', () => {
      const state = reducer(
        undefined,
        openCreateForm({
          bookId: 'work',
          prefill: { firstName: 'Alice', emails: ['alice@example.com'] },
        })
      )
      expect(state.isFormOpen).toBe(true)
      expect(state.formBookId).toBe('work')
      expect(state.prefillContact?.firstName).toBe('Alice')
    })

    it('openEditForm sets editing contact', () => {
      const state = reducer(
        undefined,
        openEditForm({ contactId: 'c-1', bookId: 'work' })
      )
      expect(state.isFormOpen).toBe(true)
      expect(state.editingContactId).toBe('c-1')
      expect(state.formBookId).toBe('work')
    })

    it('closeForm resets form state', () => {
      let state = reducer(
        undefined,
        openEditForm({ contactId: 'c-1', bookId: 'work' })
      )
      state = reducer(state, closeForm())
      expect(state.isFormOpen).toBe(false)
      expect(state.editingContactId).toBeNull()
      expect(state.prefillContact).toBeNull()
    })
  })

  describe('distribution list form actions', () => {
    it('openCreateListForm opens list form with members', () => {
      const state = reducer(
        undefined,
        openCreateListForm({
          bookId: 'work',
          members: [{ email: 'a@example.com', displayName: 'Alice' }],
        })
      )
      expect(state.isListFormOpen).toBe(true)
      expect(state.prefillListMembers).toHaveLength(1)
    })

    it('openEditListForm sets editing list id', () => {
      const state = reducer(
        undefined,
        openEditListForm({ listId: 'list-1', bookId: 'work' })
      )
      expect(state.isListFormOpen).toBe(true)
      expect(state.editingListId).toBe('list-1')
    })

    it('closeListForm resets list form state', () => {
      let state = reducer(
        undefined,
        openEditListForm({ listId: 'list-1', bookId: 'work' })
      )
      state = reducer(state, closeListForm())
      expect(state.isListFormOpen).toBe(false)
      expect(state.editingListId).toBeNull()
    })
  })
})
