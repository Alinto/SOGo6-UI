import {
  selectAllNotifications,
  selectErrorNotifications,
  selectHasNotifications,
  selectInfoNotifications,
  selectNotificationById,
  selectNotificationsByType,
  selectNotificationsCount,
  selectSuccessNotifications,
} from '../notifications-selectors'
import type { Notification } from '../notifications-types'

describe('notificationsSelectors', () => {
  const mockState = {
    notifications: {
      items: [
        {
          id: '1',
          type: 'success' as const,
          title: 'Success 1',
          message: 'Success Message',
          duration: 3000,
          timestamp: Date.now(),
        },
        {
          id: '2',
          type: 'error' as const,
          title: 'Error 1',
          message: 'Error Message',
          duration: 5000,
          timestamp: Date.now(),
        },
        {
          id: '3',
          type: 'success' as const,
          title: 'Success 2',
          message: 'Another Success',
          duration: 3000,
          timestamp: Date.now(),
        },
        {
          id: '4',
          type: 'info' as const,
          title: 'Info 1',
          message: 'Info Message',
          duration: 4000,
          timestamp: Date.now(),
        },
      ] as Notification[],
    },
  }

  describe('selectAllNotifications', () => {
    it('returns all notifications', () => {
      const result = selectAllNotifications(mockState)
      expect(result).toHaveLength(4)
      expect(result).toEqual(mockState.notifications.items)
    })

    it('returns empty array when no notifications', () => {
      const emptyState = { notifications: { items: [] } }
      const result = selectAllNotifications(emptyState)
      expect(result).toEqual([])
    })
  })

  describe('selectNotificationById', () => {
    it('returns notification by id', () => {
      const result = selectNotificationById('1')(mockState)
      expect(result).toEqual(mockState.notifications.items[0])
    })

    it('returns undefined if id not found', () => {
      const result = selectNotificationById('999')(mockState)
      expect(result).toBeUndefined()
    })

    it('returns correct notification for different ids', () => {
      const result2 = selectNotificationById('2')(mockState)
      const result4 = selectNotificationById('4')(mockState)

      expect(result2?.type).toBe('error')
      expect(result4?.type).toBe('info')
    })
  })

  describe('selectNotificationsByType', () => {
    it('returns notifications of specified type', () => {
      const result = selectNotificationsByType('success')(mockState)
      expect(result).toHaveLength(2)
      expect(result.every((n) => n.type === 'success')).toBe(true)
    })

    it('returns all errors', () => {
      const result = selectNotificationsByType('error')(mockState)
      expect(result).toHaveLength(1)
      expect(result[0].type).toBe('error')
    })

    it('returns empty array for non-existent type', () => {
      const result = selectNotificationsByType('nonexistent')(mockState)
      expect(result).toEqual([])
    })
  })

  describe('selectErrorNotifications', () => {
    it('returns only error notifications', () => {
      const result = selectErrorNotifications(mockState)
      expect(result).toHaveLength(1)
      expect(result[0].type).toBe('error')
    })

    it('returns empty array if no errors', () => {
      const stateWithoutErrors = {
        notifications: {
          items: [
            mockState.notifications.items[0],
            mockState.notifications.items[3],
          ],
        },
      }
      const result = selectErrorNotifications(stateWithoutErrors)
      expect(result).toEqual([])
    })
  })

  describe('selectSuccessNotifications', () => {
    it('returns only success notifications', () => {
      const result = selectSuccessNotifications(mockState)
      expect(result).toHaveLength(2)
      expect(result.every((n) => n.type === 'success')).toBe(true)
    })

    it('returns empty array if no successes', () => {
      const stateWithoutSuccess = {
        notifications: {
          items: [
            mockState.notifications.items[1],
            mockState.notifications.items[3],
          ],
        },
      }
      const result = selectSuccessNotifications(stateWithoutSuccess)
      expect(result).toEqual([])
    })
  })

  describe('selectInfoNotifications', () => {
    it('returns only info notifications', () => {
      const result = selectInfoNotifications(mockState)
      expect(result).toHaveLength(1)
      expect(result[0].type).toBe('info')
    })

    it('returns empty array if no info', () => {
      const stateWithoutInfo = {
        notifications: {
          items: [
            mockState.notifications.items[0],
            mockState.notifications.items[1],
          ],
        },
      }
      const result = selectInfoNotifications(stateWithoutInfo)
      expect(result).toEqual([])
    })
  })

  describe('selectHasNotifications', () => {
    it('returns true when notifications exist', () => {
      const result = selectHasNotifications(mockState)
      expect(result).toBe(true)
    })

    it('returns false when no notifications', () => {
      const emptyState = { notifications: { items: [] } }
      const result = selectHasNotifications(emptyState)
      expect(result).toBe(false)
    })

    it('returns true for single notification', () => {
      const singleState = {
        notifications: { items: [mockState.notifications.items[0]] },
      }
      const result = selectHasNotifications(singleState)
      expect(result).toBe(true)
    })
  })

  describe('selectNotificationsCount', () => {
    it('returns correct count of notifications', () => {
      const result = selectNotificationsCount(mockState)
      expect(result).toBe(4)
    })

    it('returns 0 when no notifications', () => {
      const emptyState = { notifications: { items: [] } }
      const result = selectNotificationsCount(emptyState)
      expect(result).toBe(0)
    })

    it('returns correct count for different sizes', () => {
      const twoState = {
        notifications: { items: mockState.notifications.items.slice(0, 2) },
      }
      expect(selectNotificationsCount(twoState)).toBe(2)

      const oneState = {
        notifications: { items: [mockState.notifications.items[0]] },
      }
      expect(selectNotificationsCount(oneState)).toBe(1)
    })
  })
})
