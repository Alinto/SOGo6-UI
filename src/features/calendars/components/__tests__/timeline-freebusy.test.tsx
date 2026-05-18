import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import React from 'react'
import { TimelineFreeBusy } from '../timeline-freebusy'

jest.mock('next-intl', () => {
  const { calendarsMessagesT } = require('./calendars-intl-mock')
  return {
    NextIntlClientProvider: ({ children }: { children: React.ReactNode }) =>
      React.createElement(React.Fragment, null, children),
    useLocale: () => 'en',
    useTranslations: (namespace?: string) => {
      if (namespace === 'CALENDARS') {
        return (key: string, values?: Record<string, string | number | boolean | Date>) =>
          calendarsMessagesT(key, values)
      }
      return (key: string) => key
    },
  }
})

describe('TimelineFreeBusy', () => {
  const center = new Date('2026-05-18T12:00:00.000Z')
  const teamMembers = [
    { name: 'Alice Free', email: 'alice@example.com' },
    { name: 'Bob Busy', email: 'bob@example.com' },
  ]
  const data = {
    'alice@example.com': {},
    'bob@example.com': {
      '2026-05-18': [
        {
          from: '2026-05-18T15:00:00.000Z',
          to: '2026-05-18T17:30:00.000Z',
        },
      ],
    },
  }

  describe('basic rendering', () => {
    it('renders legend with suggested window label when data is present', () => {
      render(
        <TimelineFreeBusy
          teamMembers={teamMembers}
          data={data}
          isLoading={false}
          centerDate={center}
          appointmentDuration={60}
          workingHours={{ start: 0, end: 23 }}
        />
      )
      expect(screen.getByText('Suggested window')).toBeInTheDocument()
      expect(screen.getByText('Alice Free')).toBeInTheDocument()
      expect(screen.getByText('Bob Busy')).toBeInTheDocument()
    })

    it('renders no-data message when data is undefined', () => {
      render(
        <TimelineFreeBusy teamMembers={teamMembers} centerDate={center} />
      )
      expect(screen.getByText('No availability data')).toBeInTheDocument()
    })
  })

  describe('loading state', () => {
    it('shows skeleton when loading and no cached data', () => {
      const { container } = render(
        <TimelineFreeBusy
          teamMembers={teamMembers}
          isLoading
          centerDate={center}
        />
      )
      expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
    })

    it('renders grid when loading but data is already present', () => {
      render(
        <TimelineFreeBusy
          teamMembers={teamMembers}
          data={data}
          isLoading
          centerDate={center}
        />
      )
      expect(screen.queryByText('No availability data')).not.toBeInTheDocument()
      expect(screen.getByText('Suggested window')).toBeInTheDocument()
    })
  })

  describe('layout', () => {
    it('applies card chrome to the root container', () => {
      const { container } = render(
        <TimelineFreeBusy
          teamMembers={teamMembers}
          data={data}
          isLoading={false}
          centerDate={center}
        />
      )
      const root = container.firstElementChild
      expect(root).toHaveClass('rounded-xl', 'border', 'shadow-sm')
    })
  })
})
