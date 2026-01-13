import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import React from 'react'
import Page from '../page'

describe('Tasks Page', () => {
  it('should render the feature in progress page', () => {
    render(<Page />)

    expect(screen.getByTestId('page-incoming-feature')).toBeInTheDocument()
    expect(screen.getByText('Incoming Feature')).toBeInTheDocument()
  })
})