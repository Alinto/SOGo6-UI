import {
  serializeListCreate,
  serializeListFromForm,
  serializeListPatch,
} from '../serialize-list'

describe('serializeListFromForm', () => {
  it('maps distribution list form values to create body', () => {
    expect(
      serializeListFromForm({
        name: ' Sales Team ',
        note: 'Internal only',
        memberContactIds: ['c1', 'c2'],
      })
    ).toEqual({
      name: 'Sales Team',
      description: 'Internal only',
      members: ['c1', 'c2'],
    })
  })
})

describe('serializeListPatch', () => {
  it('maps partial list updates', () => {
    expect(
      serializeListPatch({
        name: 'Updated Team',
        note: 'New note',
        memberContactIds: ['c3'],
      })
    ).toEqual({
      name: 'Updated Team',
      description: 'New note',
      members: ['c3'],
    })
  })

  it('clears description when note is empty', () => {
    expect(
      serializeListPatch({
        note: '   ',
      })
    ).toEqual({
      description: undefined,
    })
  })
})

describe('serializeListCreate', () => {
  it('builds list create payload', () => {
    expect(
      serializeListCreate({
        name: 'Team',
        description: 'All sales',
        members: ['c1'],
      })
    ).toEqual({
      name: 'Team',
      description: 'All sales',
      members: ['c1'],
    })
  })
})
