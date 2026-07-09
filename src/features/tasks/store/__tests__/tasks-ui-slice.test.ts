import '@testing-library/jest-dom'
import reducer, {
  enterSelectionMode,
  exitSelectionMode,
  openCreateForm,
  setCalendarFilter,
  setSelectedTaskKeys,
  setStatusFilter,
  toggleTaskSelection,
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
      expect(state.selectionMode).toBe(false)
      expect(state.selectedTaskKeys).toEqual([])
    })
  })

  describe('setStatusFilter', () => {
    it('updates status filter', () => {
      const state = reducer(undefined, setStatusFilter('today'))
      expect(state.statusFilter).toBe('today')
    })

    it('clears selection state', () => {
      let state = reducer(undefined, enterSelectionMode())
      state = reducer(state, setSelectedTaskKeys(['task-1']))
      state = reducer(state, setStatusFilter('completed'))
      expect(state.selectionMode).toBe(false)
      expect(state.selectedTaskKeys).toEqual([])
    })
  })

  describe('setCalendarFilter', () => {
    it('sets selected calendar key', () => {
      const state = reducer(undefined, setCalendarFilter('cal-1'))
      expect(state.selectedCalendarKey).toBe('cal-1')
    })

    it('clears selection state', () => {
      let state = reducer(undefined, enterSelectionMode())
      state = reducer(state, setSelectedTaskKeys(['task-1']))
      state = reducer(state, setCalendarFilter('cal-1'))
      expect(state.selectionMode).toBe(false)
      expect(state.selectedTaskKeys).toEqual([])
    })
  })

  describe('selection mode', () => {
    it('enters and exits selection mode', () => {
      let state = reducer(undefined, enterSelectionMode())
      expect(state.selectionMode).toBe(true)
      state = reducer(state, setSelectedTaskKeys(['task-1']))
      state = reducer(state, exitSelectionMode())
      expect(state.selectionMode).toBe(false)
      expect(state.selectedTaskKeys).toEqual([])
    })

    it('toggles task selection', () => {
      let state = reducer(undefined, enterSelectionMode())
      state = reducer(state, toggleTaskSelection('task-1'))
      expect(state.selectedTaskKeys).toEqual(['task-1'])
      state = reducer(state, toggleTaskSelection('task-1'))
      expect(state.selectedTaskKeys).toEqual([])
    })
  })

  describe('form actions', () => {
    it('openCreateForm opens form without editing key', () => {
      const state = reducer(undefined, openCreateForm())
      expect(state.isFormOpen).toBe(true)
      expect(state.editingTaskKey).toBeNull()
    })

    it('openCreateForm clears selection state', () => {
      let state = reducer(undefined, enterSelectionMode())
      state = reducer(state, setSelectedTaskKeys(['task-1']))
      state = reducer(state, openCreateForm())
      expect(state.selectionMode).toBe(false)
      expect(state.selectedTaskKeys).toEqual([])
    })
  })

  describe('exports', () => {
    it('default export is a reducer function', () => {
      expect(typeof reducer).toBe('function')
    })
  })
})
