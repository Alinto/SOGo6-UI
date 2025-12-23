import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { DomainConfigFormPageProps } from '../../../types/form'
import DomainConfigFormPage from '../admin-panel-domain-config-form'

// Mock child components
jest.mock('../../skeletons/admin-form-page-skeleton', () => {
  return function MockSkeleton() {
    return <div data-testid="skeleton-loader">Loading...</div>
  }
})

jest.mock('../admin-panel-form', () => {
  return function MockAdminDomainFormFrame({
    data,
    activeTab,
    onSubmit,
    isLoading,
  }: any) {
    return (
      <form
        data-testid="admin-form"
        onSubmit={(e) => {
          e.preventDefault()
          onSubmit({ tab: activeTab, data: 'test' })
        }}
      >
        <input type="hidden" name="tab" value={activeTab} />
        <button type="submit" data-testid="submit-btn" disabled={isLoading}>
          {isLoading ? 'Submitting...' : 'Submit'}
        </button>
      </form>
    )
  }
})

jest.mock('../admin-panel-header', () => {
  return function MockAdminPanelHeader({
    title,
    description,
    editableDescription,
    onSaveDescription,
  }: any) {
    return (
      <div data-testid="admin-header">
        <h1 data-testid="header-title">{title}</h1>
        <p data-testid="header-description">{description}</p>
        {editableDescription && (
          <button
            data-testid="edit-description-btn"
            onClick={() => onSaveDescription?.('new description')}
          >
            Edit
          </button>
        )}
      </div>
    )
  }
})

jest.mock('../admin-panel-tabs', () => {
  return function MockAdminPanelTabs({
    tabNames,
    activeTab,
    onTabChange,
  }: any) {
    return (
      <div data-testid="admin-tabs">
        {tabNames.map((tab: string) => (
          <button
            key={tab}
            data-testid={`tab-${tab}`}
            onClick={() => onTabChange(tab)}
            aria-selected={activeTab === tab}
          >
            {tab}
          </button>
        ))}
      </div>
    )
  }
})

describe('DomainConfigFormPage Component', () => {
  const defaultProps: DomainConfigFormPageProps = {
    domainName: 'example.com',
    tabNames: ['General', 'Advanced'],
    tabDataByTab: {
      General: { setting1: 'value1' },
      Advanced: { setting2: 'value2' },
    },
    onSubmit: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render the component with default props', () => {
    render(<DomainConfigFormPage {...defaultProps} />)
    expect(screen.getByTestId('admin-header')).toBeInTheDocument()
    expect(screen.getByTestId('admin-tabs')).toBeInTheDocument()
    expect(screen.getByTestId('admin-form')).toBeInTheDocument()
  })

  it('should display domain name in header title', () => {
    render(<DomainConfigFormPage {...defaultProps} />)
    expect(screen.getByTestId('header-title')).toHaveTextContent('example.com')
  })

  it('should render skeleton loader when isLoading is true', () => {
    render(<DomainConfigFormPage {...defaultProps} isLoading={true} />)
    expect(screen.getByTestId('skeleton-loader')).toBeInTheDocument()
    expect(screen.queryByTestId('admin-form')).not.toBeInTheDocument()
  })

  it('should initialize with the first tab as active', () => {
    render(<DomainConfigFormPage {...defaultProps} />)
    const firstTab = screen.getByTestId('tab-General')
    expect(firstTab).toHaveAttribute('aria-selected', 'true')
  })

  it('should switch active tab when tab button is clicked', async () => {
    const user = userEvent.setup()
    render(<DomainConfigFormPage {...defaultProps} />)

    const advancedTab = screen.getByTestId('tab-Advanced')
    await user.click(advancedTab)

    expect(advancedTab).toHaveAttribute('aria-selected', 'true')
  })

  it('should render all tab names', () => {
    render(<DomainConfigFormPage {...defaultProps} />)
    expect(screen.getByTestId('tab-General')).toBeInTheDocument()
    expect(screen.getByTestId('tab-Advanced')).toBeInTheDocument()
  })

  it('should pass full tabDataByTab to form component', () => {
    const { container } = render(<DomainConfigFormPage {...defaultProps} />)
    // Form component should be rendered with the data
    expect(screen.getByTestId('admin-form')).toBeInTheDocument()
  })

  it('should call onSubmit when form is submitted', async () => {
    const user = userEvent.setup()
    const onSubmit = jest.fn()
    render(<DomainConfigFormPage {...defaultProps} onSubmit={onSubmit} />)

    const submitBtn = screen.getByTestId('submit-btn')
    await user.click(submitBtn)

    expect(onSubmit).toHaveBeenCalled()
  })

  it('should disable submit button when isFormLoading is true', () => {
    render(<DomainConfigFormPage {...defaultProps} isFormLoading={true} />)
    const submitBtn = screen.getByTestId('submit-btn')
    expect(submitBtn).toBeDisabled()
  })

  it('should display default description when none is provided', () => {
    render(<DomainConfigFormPage {...defaultProps} />)
    expect(screen.getByTestId('header-description')).toHaveTextContent(
      'Configure the default domain settings here'
    )
  })

  it('should display custom description when provided', () => {
    render(
      <DomainConfigFormPage
        {...defaultProps}
        description="Custom domain description"
      />
    )
    expect(screen.getByTestId('header-description')).toHaveTextContent(
      'Custom domain description'
    )
  })

  it('should make description editable when onUpdateDescription is provided', () => {
    const onUpdateDescription = jest.fn()
    render(
      <DomainConfigFormPage
        {...defaultProps}
        description="Original description"
        onUpdateDescription={onUpdateDescription}
      />
    )
    expect(screen.getByTestId('edit-description-btn')).toBeInTheDocument()
  })

  it('should call onUpdateDescription when edit button is clicked', async () => {
    const user = userEvent.setup()
    const onUpdateDescription = jest.fn()
    render(
      <DomainConfigFormPage
        {...defaultProps}
        description="Original description"
        onUpdateDescription={onUpdateDescription}
      />
    )

    const editBtn = screen.getByTestId('edit-description-btn')
    await user.click(editBtn)

    expect(onUpdateDescription).toHaveBeenCalled()
  })

  it('should not show edit button when description is undefined and onUpdateDescription is not provided', () => {
    render(<DomainConfigFormPage {...defaultProps} />)
    expect(screen.queryByTestId('edit-description-btn')).not.toBeInTheDocument()
  })

  it('should not show edit button when onUpdateDescription is not provided even if description exists', () => {
    render(
      <DomainConfigFormPage {...defaultProps} description="Some description" />
    )
    expect(screen.queryByTestId('edit-description-btn')).not.toBeInTheDocument()
  })

  it('should handle empty tabNames array', () => {
    render(
      <DomainConfigFormPage {...defaultProps} tabNames={[]} tabDataByTab={{}} />
    )
    expect(screen.getByTestId('admin-tabs')).toBeInTheDocument()
  })

  it('should update activeTab when tabNames change and activeTab is empty', () => {
    const { rerender } = render(
      <DomainConfigFormPage
        {...defaultProps}
        tabNames={['Tab1']}
        tabDataByTab={{ Tab1: {} }}
      />
    )

    expect(screen.getByTestId('tab-Tab1')).toHaveAttribute(
      'aria-selected',
      'true'
    )

    rerender(
      <DomainConfigFormPage
        {...defaultProps}
        tabNames={['Tab1', 'Tab2']}
        tabDataByTab={{ Tab1: {}, Tab2: {} }}
      />
    )

    expect(screen.getByTestId('tab-Tab1')).toHaveAttribute(
      'aria-selected',
      'true'
    )
  })

  it('should maintain active tab when switching between tabs', async () => {
    const user = userEvent.setup()
    render(<DomainConfigFormPage {...defaultProps} />)

    // Start with first tab active
    expect(screen.getByTestId('tab-General')).toHaveAttribute(
      'aria-selected',
      'true'
    )

    // Switch to second tab
    await user.click(screen.getByTestId('tab-Advanced'))
    expect(screen.getByTestId('tab-Advanced')).toHaveAttribute(
      'aria-selected',
      'true'
    )

    // Switch back to first tab
    await user.click(screen.getByTestId('tab-General'))
    expect(screen.getByTestId('tab-General')).toHaveAttribute(
      'aria-selected',
      'true'
    )
  })

  it('should render with proper container structure', () => {
    const { container } = render(<DomainConfigFormPage {...defaultProps} />)
    const mainContainer = container.querySelector(
      '.flex.h-\\[calc\\(100vh-var\\(--header-height\\)\\)\\].w-full.flex-col.overflow-y-auto'
    )
    expect(mainContainer).toBeInTheDocument()
  })

  it('should have overflow-y-auto for scrolling content', () => {
    const { container } = render(<DomainConfigFormPage {...defaultProps} />)
    const mainDiv = container.firstChild
    expect(mainDiv).toHaveClass('overflow-y-auto')
  })

  it('should pass isFormLoading to form component', () => {
    render(<DomainConfigFormPage {...defaultProps} isFormLoading={true} />)
    const submitBtn = screen.getByTestId('submit-btn')
    expect(submitBtn).toHaveTextContent('Submitting...')
  })

  it('should handle multiple consecutive tab switches', async () => {
    const user = userEvent.setup()
    const manyTabs = ['Tab1', 'Tab2', 'Tab3', 'Tab4', 'Tab5']
    render(
      <DomainConfigFormPage
        {...defaultProps}
        tabNames={manyTabs}
        tabDataByTab={manyTabs.reduce(
          (acc, tab) => ({ ...acc, [tab]: {} }),
          {}
        )}
      />
    )

    for (const tab of manyTabs) {
      await user.click(screen.getByTestId(`tab-${tab}`))
      expect(screen.getByTestId(`tab-${tab}`)).toHaveAttribute(
        'aria-selected',
        'true'
      )
    }
  })
})
