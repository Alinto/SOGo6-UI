import '@testing-library/jest-dom'
import {
  Calendar1,
  ClipboardCheck,
  Contact2,
  Mail,
  NotepadText,
} from 'lucide-react'
import { ModuleNavIcon } from '../module-nav-icons'

describe('ModuleNavIcon', () => {
  it('maps each module key to the expected Lucide component and title', () => {
    expect(ModuleNavIcon.Mail.icon).toBe(Mail)
    expect(ModuleNavIcon.Mail.title).toBe('Mail')
    expect(ModuleNavIcon.AddressBook.icon).toBe(Contact2)
    expect(ModuleNavIcon.AddressBook.title).toBe('Address Books')
    expect(ModuleNavIcon.Calendar.icon).toBe(Calendar1)
    expect(ModuleNavIcon.Calendar.title).toBe('Calendars')
    expect(ModuleNavIcon.Tasks.icon).toBe(ClipboardCheck)
    expect(ModuleNavIcon.Tasks.title).toBe('Tasks')
    expect(ModuleNavIcon.Notes.icon).toBe(NotepadText)
    expect(ModuleNavIcon.Notes.title).toBe('Notes')
  })

  it('is frozen as a const object export', () => {
    expect(Object.keys(ModuleNavIcon).sort()).toEqual([
      'AddressBook',
      'Calendar',
      'Mail',
      'Notes',
      'Tasks',
    ])
  })
})
