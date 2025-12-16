import type { NotificationsState } from '../notifications-slice'
import notificationsReducer, {
  addNotification,
  clearAllNotifications,
  clearNotificationsByType,
  removeNotification,
} from '../notifications-slice'

describe('notificationsSlice', () => {
  const initialState: NotificationsState = {
    items: [],
  }

  describe('addNotification', () => {
    it('adds a new notification to the state', () => {
      const action = addNotification({
        type: 'success',
        title: 'Test',
        message: 'Test Message',
      })

      const state = notificationsReducer(initialState, action)
      expect(state.items).toHaveLength(1)
      expect(state.items[0]).toMatchObject({
        type: 'success',
        title: 'Test',
        message: 'Test Message',
      })
    })

    it('generates a unique ID for the notification', () => {
      const action1 = addNotification({
        type: 'success',
        title: 'Test 1',
        message: 'Message 1',
      })
      const action2 = addNotification({
        type: 'error',
        title: 'Test 2',
        message: 'Message 2',
      })

      let state = notificationsReducer(initialState, action1)
      state = notificationsReducer(state, action2)

      expect(state.items[0].id).not.toBe(state.items[1].id)
    })

    it('sets default duration to 5000ms', () => {
      const action = addNotification({
        type: 'info',
        title: 'Test',
        message: 'Message',
      })

      const state = notificationsReducer(initialState, action)
      expect(state.items[0].duration).toBe(5000)
    })

    it('respects custom duration', () => {
      const action = addNotification({
        type: 'success',
        title: 'Test',
        message: 'Message',
        duration: 3000,
      })

      const state = notificationsReducer(initialState, action)
      expect(state.items[0].duration).toBe(3000)
    })

    it('sets duration to 0 if provided', () => {
      const action = addNotification({
        type: 'info',
        title: 'Test',
        message: 'Message',
        duration: 0,
      })

      const state = notificationsReducer(initialState, action)
      expect(state.items[0].duration).toBe(0)
    })

    it('sets timestamp', () => {
      const beforeTime = Date.now()
      const action = addNotification({
        type: 'success',
        title: 'Test',
        message: 'Message',
      })
      const afterTime = Date.now()

      const state = notificationsReducer(initialState, action)
      expect(state.items[0].timestamp).toBeGreaterThanOrEqual(beforeTime)
    })

    it('preserves existing notifications when adding new ones', () => {
      let state = notificationsReducer(
        initialState,
        addNotification({
          type: 'success',
          title: 'First',
          message: 'First Message',
        })
      )

      state = notificationsReducer(
        state,
        addNotification({
          type: 'error',
          title: 'Second',
          message: 'Second Message',
        })
      )

      expect(state.items).toHaveLength(2)
      expect(state.items[0].title).toBe('First')
      expect(state.items[1].title).toBe('Second')
    })
  })

  describe('removeNotification', () => {
    it('removes notification by id', () => {
      let state = notificationsReducer(
        initialState,
        addNotification({
          type: 'success',
          title: 'Test',
          message: 'Message',
        })
      )

      const notificationId = state.items[0].id
      state = notificationsReducer(state, removeNotification(notificationId))

      expect(state.items).toHaveLength(0)
    })

    it('removes only the specified notification', () => {
      let state = notificationsReducer(
        initialState,
        addNotification({
          type: 'success',
          title: 'First',
          message: 'Message 1',
        })
      )
      state = notificationsReducer(
        state,
        addNotification({
          type: 'error',
          title: 'Second',
          message: 'Message 2',
        })
      )

      const firstId = state.items[0].id
      state = notificationsReducer(state, removeNotification(firstId))

      expect(state.items).toHaveLength(1)
      expect(state.items[0].title).toBe('Second')
    })

    it('does nothing if notification id not found', () => {
      const action = removeNotification('non-existent-id')
      const state = notificationsReducer(initialState, action)

      expect(state.items).toHaveLength(0)
    })
  })

  describe('clearAllNotifications', () => {
    it('clears all notifications', () => {
      let state = notificationsReducer(
        initialState,
        addNotification({
          type: 'success',
          title: 'Test 1',
          message: 'Message 1',
        })
      )
      state = notificationsReducer(
        state,
        addNotification({
          type: 'error',
          title: 'Test 2',
          message: 'Message 2',
        })
      )
      state = notificationsReducer(
        state,
        addNotification({
          type: 'info',
          title: 'Test 3',
          message: 'Message 3',
        })
      )

      expect(state.items).toHaveLength(3)

      state = notificationsReducer(state, clearAllNotifications())
      expect(state.items).toHaveLength(0)
    })

    it('works on empty state', () => {
      const state = notificationsReducer(initialState, clearAllNotifications())
      expect(state.items).toHaveLength(0)
    })
  })

  describe('clearNotificationsByType', () => {
    it('clears notifications of specific type', () => {
      let state = notificationsReducer(
        initialState,
        addNotification({
          type: 'success',
          title: 'Success 1',
          message: 'Message 1',
        })
      )
      state = notificationsReducer(
        state,
        addNotification({
          type: 'error',
          title: 'Error 1',
          message: 'Message 2',
        })
      )
      state = notificationsReducer(
        state,
        addNotification({
          type: 'success',
          title: 'Success 2',
          message: 'Message 3',
        })
      )

      expect(state.items).toHaveLength(3)

      state = notificationsReducer(state, clearNotificationsByType('success'))

      expect(state.items).toHaveLength(1)
      expect(state.items[0].type).toBe('error')
    })

    it('clears all errors', () => {
      let state = notificationsReducer(
        initialState,
        addNotification({
          type: 'error',
          title: 'Error 1',
          message: 'Message 1',
        })
      )
      state = notificationsReducer(
        state,
        addNotification({
          type: 'error',
          title: 'Error 2',
          message: 'Message 2',
        })
      )
      state = notificationsReducer(
        state,
        addNotification({
          type: 'info',
          title: 'Info',
          message: 'Message 3',
        })
      )

      state = notificationsReducer(state, clearNotificationsByType('error'))

      expect(state.items).toHaveLength(1)
      expect(state.items[0].type).toBe('info')
    })

    it('does nothing if type not found', () => {
      let state = notificationsReducer(
        initialState,
        addNotification({
          type: 'success',
          title: 'Success',
          message: 'Message',
        })
      )

      state = notificationsReducer(
        state,
        clearNotificationsByType('nonexistent' as any)
      )

      expect(state.items).toHaveLength(1)
    })
  })
})
