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
  it('maps each module key to the expected Lucide component', () => {
    expect(ModuleNavIcon.Mail).toBe(Mail)
    expect(ModuleNavIcon.AddressBook).toBe(Contact2)
    expect(ModuleNavIcon.Calendar).toBe(Calendar1)
    expect(ModuleNavIcon.Tasks).toBe(ClipboardCheck)
    expect(ModuleNavIcon.Notes).toBe(NotepadText)
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
