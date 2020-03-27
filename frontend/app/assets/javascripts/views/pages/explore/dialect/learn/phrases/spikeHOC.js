import React from 'react'

// REDUX
import { compose } from 'redux'
import { connect } from 'react-redux'
// REDUX: actions/dispatch/func
import { fetchCategories } from 'providers/redux/reducers/fvCategory'
import { fetchCharacters } from 'providers/redux/reducers/fvCharacter'
import { fetchDialect2 } from 'providers/redux/reducers/fvDialect'
import { fetchDocument } from 'providers/redux/reducers/document'
import { fetchPhrases } from 'providers/redux/reducers/fvPhrase'
import { fetchPortal } from 'providers/redux/reducers/fvPortal'
import { overrideBreadcrumbs } from 'providers/redux/reducers/navigation'
import { pushWindowPath } from 'providers/redux/reducers/windowPath'
import { searchDialectUpdate } from 'providers/redux/reducers/searchDialect'
import { setListViewMode } from 'providers/redux/reducers/listView'
import { setRouteParams } from 'providers/redux/reducers/navigation'

const spikeHOC = (Component) => (props) => {
  // NOTE: Techinque for filtering out props that don't need to be passed down to children
  // The children may need `dispatch` though
  // eslint-disable-next-line
  const { dispatch, ...propsToPassAlong } = props
  return <Component {...propsToPassAlong} />
}

// REDUX: reducers/state
const mapStateToProps = (state) => {
  const {
    document,
    fvCategory,
    fvCharacter,
    fvDialect,
    fvPhrase,
    fvPortal,
    listView,
    navigation,
    nuxeo,
    searchDialect,
    windowPath,
  } = state

  const { computeCategories } = fvCategory
  const { computeCharacters } = fvCharacter
  const { computeDialect2 } = fvDialect
  const { computeDocument } = document
  const { computeLogin } = nuxeo
  const { computePhrases } = fvPhrase
  const { computePortal } = fvPortal
  const { computeSearchDialect } = searchDialect
  const { properties, route } = navigation
  const { splitWindowPath, _windowPath } = windowPath

  return {
    computeCategories,
    computeCharacters,
    computeDocument,
    computeLogin,
    computePortal,
    computeSearchDialect,
    listView,
    properties,
    splitWindowPath,
    windowPath: _windowPath,
    computeDialect2,
    computePhrases,
    navigationRouteSearch: route.search,
  }
}

// REDUX: actions/dispatch/func
const mapDispatchToProps = {
  fetchCategories,
  fetchCharacters,
  fetchDocument,
  fetchPortal,
  overrideBreadcrumbs,
  pushWindowPath,
  searchDialectUpdate,
  setListViewMode,
  fetchDialect2,
  fetchPhrases,
  setRouteParams,
}

const wrappedSpikeHOC = compose(connect(mapStateToProps, mapDispatchToProps), spikeHOC)
export default wrappedSpikeHOC
