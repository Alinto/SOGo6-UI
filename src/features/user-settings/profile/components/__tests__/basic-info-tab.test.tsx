import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useForm } from 'react-hook-form'
import { Form } from '@/components/ui/form'
import { BasicInfoTab } from '../basic-info-tab'
import {
  PP_DEFAULT,
  PP_GRAVATAR,
  PP_LIBRAVATAR,
  PP_USERSOURCE,
} from '../../../store/user-preferences-api-types'

// ── Mocks ─────────────────────────────────────────────────────────────────────

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

jest.mock('@/features/user-profile/components/profile-avatar', () => ({
  ProfileAvatar: ({ pictureSource }: { pictureSource: string }) => (
    <div data-testid="profile-avatar" data-picture-source={pictureSource} />
  ),
}))

// ── Helpers ───────────────────────────────────────────────────────────────────

const DEFAULT_VALUES = {
  profilePictureSource: PP_DEFAULT,
  mail: 'john@example.com',
  uid: 'jdoe',
  cn: 'John Doe',
  team: 'Engineering',
  company: 'Acme Corp',
  aliases: [] as string[],
}

function Wrapper(defaultValues: Partial<typeof DEFAULT_VALUES> = {}) {
  const form = useForm({ defaultValues: { ...DEFAULT_VALUES, ...defaultValues } })
  return (
    <Form {...form}>
      <BasicInfoTab form={form as any} />
    </Form>
  )
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('BasicInfoTab', () => {
  describe('read-only fields', () => {
    it('displays uid', () => {
      render(<Wrapper />)
      expect(screen.getByText('jdoe')).toBeInTheDocument()
    })

    it('displays "-" when uid is empty', () => {
      render(<Wrapper uid="" />)
      // There may be multiple "-" so just confirm at least one exists
      expect(screen.getAllByText('-').length).toBeGreaterThan(0)
    })

    it('displays mail', () => {
      render(<Wrapper />)
      // mail appears both in the read-only field and the avatar — use getAllBy
      expect(screen.getAllByText('john@example.com').length).toBeGreaterThan(0)
    })

    it('displays cn (full name)', () => {
      render(<Wrapper />)
      expect(screen.getByText('John Doe')).toBeInTheDocument()
    })

    it('displays team', () => {
      render(<Wrapper />)
      expect(screen.getByText('Engineering')).toBeInTheDocument()
    })

    it('displays company', () => {
      render(<Wrapper />)
      expect(screen.getByText('Acme Corp')).toBeInTheDocument()
    })

    it('displays "-" for empty optional fields', () => {
      render(<Wrapper uid="" mail="" cn="" team="" company="" />)
      const dashes = screen.getAllByText('-')
      // uid, mail, cn, team, company → at least 5 dashes
      expect(dashes.length).toBeGreaterThanOrEqual(5)
    })
  })

  describe('aliases', () => {
    it('does not render aliases section when list is empty', () => {
      render(<Wrapper aliases={[]} />)
      expect(screen.queryByText('basicInfo.aliases')).not.toBeInTheDocument()
    })

    it('renders aliases when list is not empty', () => {
      render(<Wrapper aliases={['alias1@example.com', 'alias2@example.com']} />)
      expect(screen.getByText('alias1@example.com')).toBeInTheDocument()
      expect(screen.getByText('alias2@example.com')).toBeInTheDocument()
    })

    it('renders the aliases label when aliases exist', () => {
      render(<Wrapper aliases={['alias@example.com']} />)
      expect(screen.getByText('basicInfo.aliases')).toBeInTheDocument()
    })
  })

  describe('profile picture source selection', () => {
    it('renders all four radio options', () => {
      render(<Wrapper />)
      expect(screen.getByLabelText('profilePictureSource.useDefault')).toBeInTheDocument()
      expect(screen.getByLabelText('profilePictureSource.useGravatar')).toBeInTheDocument()
      expect(screen.getByLabelText('profilePictureSource.useLibravatar')).toBeInTheDocument()
      expect(screen.getByLabelText('profilePictureSource.useCustom')).toBeInTheDocument()
    })

    it('selects PP_DEFAULT radio by default', () => {
      render(<Wrapper />)
      expect(screen.getByLabelText('profilePictureSource.useDefault')).toBeChecked()
    })

    it('selects PP_GRAVATAR radio when initial value is PP_GRAVATAR', () => {
      render(<Wrapper profilePictureSource={PP_GRAVATAR} />)
      expect(screen.getByLabelText('profilePictureSource.useGravatar')).toBeChecked()
    })

    it('changes selection when a radio is clicked', async () => {
      render(<Wrapper />)
      await userEvent.click(screen.getByLabelText('profilePictureSource.useGravatar'))
      expect(screen.getByLabelText('profilePictureSource.useGravatar')).toBeChecked()
      expect(screen.getByLabelText('profilePictureSource.useDefault')).not.toBeChecked()
    })
  })

  describe('selected source display text', () => {
    it('shows useDefault text when PP_DEFAULT is selected', () => {
      render(<Wrapper profilePictureSource={PP_DEFAULT} />)
      // The label text appears both in the radio label and the display text
      expect(screen.getAllByText('profilePictureSource.useDefault').length).toBeGreaterThanOrEqual(2)
    })

    it('shows useGravatar text when PP_GRAVATAR is selected', () => {
      render(<Wrapper profilePictureSource={PP_GRAVATAR} />)
      expect(screen.getAllByText('profilePictureSource.useGravatar').length).toBeGreaterThanOrEqual(2)
    })

    it('shows useLibravatar text when PP_LIBRAVATAR is selected', () => {
      render(<Wrapper profilePictureSource={PP_LIBRAVATAR} />)
      expect(screen.getAllByText('profilePictureSource.useLibravatar').length).toBeGreaterThanOrEqual(2)
    })

    it('shows useCustom text when PP_USERSOURCE is selected', () => {
      render(<Wrapper profilePictureSource={PP_USERSOURCE} />)
      expect(screen.getAllByText('profilePictureSource.useCustom').length).toBeGreaterThanOrEqual(2)
    })
  })

  describe('ProfileAvatar', () => {
    it('renders the ProfileAvatar component', () => {
      render(<Wrapper />)
      expect(screen.getByTestId('profile-avatar')).toBeInTheDocument()
    })

    it('passes the selected pictureSource to ProfileAvatar', () => {
      render(<Wrapper profilePictureSource={PP_GRAVATAR} />)
      expect(screen.getByTestId('profile-avatar')).toHaveAttribute(
        'data-picture-source',
        PP_GRAVATAR
      )
    })

    it('updates ProfileAvatar pictureSource when radio selection changes', async () => {
      render(<Wrapper profilePictureSource={PP_DEFAULT} />)
      await userEvent.click(screen.getByLabelText('profilePictureSource.useLibravatar'))
      expect(screen.getByTestId('profile-avatar')).toHaveAttribute(
        'data-picture-source',
        PP_LIBRAVATAR
      )
    })
  })

  describe('section headings', () => {
    it('renders the profile picture section title', () => {
      render(<Wrapper />)
      expect(screen.getByText('profilePictureSource.title')).toBeInTheDocument()
    })

    it('renders the basic info section title', () => {
      render(<Wrapper />)
      expect(screen.getByText('basicInfo.title')).toBeInTheDocument()
    })

    it('renders the extra info section title', () => {
      render(<Wrapper />)
      expect(screen.getByText('extraInfo.title')).toBeInTheDocument()
    })
  })
})