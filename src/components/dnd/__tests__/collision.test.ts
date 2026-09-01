import { appCollisionDetection } from '../collision'

const pointerWithin = jest.fn()
const rectIntersection = jest.fn()

jest.mock('@dnd-kit/core', () => ({
  pointerWithin: (...args: unknown[]) => pointerWithin(...args),
  rectIntersection: (...args: unknown[]) => rectIntersection(...args),
}))

describe('appCollisionDetection', () => {
  const args = { droppableRects: new Map() } as never

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns pointer collisions when any exist', () => {
    const hits = [{ id: 'folder:INBOX' }]
    pointerWithin.mockReturnValue(hits)

    expect(appCollisionDetection(args)).toBe(hits)
    expect(rectIntersection).not.toHaveBeenCalled()
  })

  it('falls back to rectangle intersection', () => {
    pointerWithin.mockReturnValue([])
    const hits = [{ id: 'folder:Archive' }]
    rectIntersection.mockReturnValue(hits)

    expect(appCollisionDetection(args)).toBe(hits)
    expect(rectIntersection).toHaveBeenCalledWith(args)
  })
})
