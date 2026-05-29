import '@testing-library/jest-dom'
import reducer, {
  closeForm,
  openCreateForm,
  openEditForm,
  setCalendarFilter,
  setSearchQuery,
  setStatusFilter,
} from '../tasks-ui-slice'

describe('tasksUiSlice', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('initial state', () => {
    it('has default filter and closed form', () => {
      const state = reducer(undefined, { type: '@@INIT' })
      expect(state.statusFilter).toBe('all')
      expect(state.isFormOpen).toBe(false)
      expect(state.selectedCalendarKey).toBeNull()
      expect(state.searchQuery).toBe('')
    })
  })

  describe('setStatusFilter', () => {
    it('updates status filter', () => {
      const state = reducer(undefined, setStatusFilter('today'))
      expect(state.statusFilter).toBe('today')
    })
  })

  describe('setCalendarFilter', () => {
    it('sets selected calendar key', () => {
      const state = reducer(undefined, setCalendarFilter('cal-1'))
      expect(state.selectedCalendarKey).toBe('cal-1')
    })
  })

  describe('setSearchQuery', () => {
    it('updates search query', () => {
      const state = reducer(undefined, setSearchQuery('hello'))
      expect(state.searchQuery).toBe('hello')
    })
  })

  describe('form actions', () => {
    it('openCreateForm opens form without editing key', () => {
      const state = reducer(undefined, openCreateForm())
      expect(state.isFormOpen).toBe(true)
      expect(state.editingTaskKey).toBeNull()
    })

    it('openEditForm sets editing key', () => {
      const state = reducer(undefined, openEditForm('task-1'))
      expect(state.isFormOpen).toBe(true)
      expect(state.editingTaskKey).toBe('task-1')
    })

    it('closeForm resets form state', () => {
      let state = reducer(undefined, openEditForm('task-1'))
      state = reducer(state, closeForm())
      expect(state.isFormOpen).toBe(false)
      expect(state.editingTaskKey).toBeNull()
    })
  })

  describe('exports', () => {
    it('default export is a reducer function', () => {
      expect(typeof reducer).toBe('function')
    })
  })
})
