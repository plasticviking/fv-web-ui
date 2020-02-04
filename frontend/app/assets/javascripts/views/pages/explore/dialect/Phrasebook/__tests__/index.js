// A11Y
const { axe, toHaveNoViolations } = require('jest-axe')
expect.extend(toHaveNoViolations)
import ReactDOMServer from 'react-dom/server'

// Standard/Unit
import React from 'react'

jest.mock('providers/redux/reducers/rest')
jest.mock('common/NavigationHelpers')

// Component to test
import { Category } from '../create'
const props = {
  // REDUX: reducers/state
  routeParams: {},
  computeCategories: {},
  computeCreateCategory: {},
  computeCategory: {},
  computeDialect: {},
  computeDialect2: {},
  splitWindowPath: [],
  // REDUX: actions/dispatch/func
  fetchCategories: () => {},
  fetchDialect: () => {},
  pushWindowPath: () => {},
}

describe('Category > Create', () => {
  test('Accessibility', async() => {
    const html = ReactDOMServer.renderToString(<Category {...props} />)
    const results = await axe(html)
    expect(results).toHaveNoViolations()
  })
})

