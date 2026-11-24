import {
  fitRailSections,
  RAIL_GAP,
  RAIL_ROW_HEIGHT,
  RAIL_SEPARATOR_HEIGHT,
} from '../fit-rail-sections'

/** Height of `rows` rows and `lines` section lines, gaps included. */
const heightOf = (rows: number, lines = 0) =>
  rows * RAIL_ROW_HEIGHT +
  (rows - 1) * RAIL_GAP +
  lines * (RAIL_SEPARATOR_HEIGHT + RAIL_GAP)

describe('fitRailSections', () => {
  it('keeps everything while the height is unknown', () => {
    expect(fitRailSections([['a', 'b'], [], ['c']], null)).toEqual({
      sections: [['a', 'b'], ['c']],
      hiddenCount: 0,
    })
  })

  it('keeps everything when it all fits, lines included', () => {
    expect(fitRailSections([['a', 'b'], ['c']], heightOf(3, 1))).toEqual({
      sections: [['a', 'b'], ['c']],
      hiddenCount: 0,
    })
  })

  it('keeps the room of the "+N" row when some calendars do not fit', () => {
    // 4 rows of room: 3 calendars + the "+N" row.
    expect(fitRailSections([['a', 'b', 'c', 'd', 'e']], heightOf(4))).toEqual({
      sections: [['a', 'b', 'c']],
      hiddenCount: 2,
    })
  })

  it('counts the section line in the room taken', () => {
    // Room for 3 rows, but not for 3 rows and a line.
    expect(fitRailSections([['a', 'b'], ['c']], heightOf(3, 1) - 1)).toEqual({
      sections: [['a', 'b']],
      hiddenCount: 1,
    })
  })

  it('cuts in the middle of a later section', () => {
    expect(fitRailSections([['a'], ['b', 'c', 'd']], heightOf(3, 1))).toEqual({
      sections: [['a'], ['b']],
      hiddenCount: 2,
    })
  })

  it('shows only "+N" when not even one calendar fits with it', () => {
    expect(fitRailSections([['a', 'b']], RAIL_ROW_HEIGHT)).toEqual({
      sections: [],
      hiddenCount: 2,
    })
  })

  it('skips empty sections', () => {
    expect(fitRailSections([[], ['a'], []], heightOf(1))).toEqual({
      sections: [['a']],
      hiddenCount: 0,
    })
  })
})
