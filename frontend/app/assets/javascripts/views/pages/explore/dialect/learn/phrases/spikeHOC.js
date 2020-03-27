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
import PropTypes from 'prop-types'
import ProviderHelpers from 'common/ProviderHelpers'
import selectn from 'selectn'

import { getColumnsPhrases } from './spikePhrasesColumns'
const { array, bool, func, object, string } = PropTypes
const spikeHOC = (Component) => {
  return class extends React.Component {
    static propTypes = {
      hasPagination: bool,
      routeParams: object.isRequired,
      // REDUX: reducers/state
      computeCharacters: object.isRequired,
      computeDialect2: object.isRequired,
      computeCategories: object.isRequired,
      computeDocument: object.isRequired,
      computeLogin: object.isRequired,
      computePhrases: object.isRequired,
      computePortal: object.isRequired,
      properties: object.isRequired,
      splitWindowPath: array.isRequired,
      windowPath: string.isRequired,
      // REDUX: actions/dispatch/func
      fetchPhrases: func.isRequired,
      fetchCategories: func.isRequired,
      fetchCharacters: func.isRequired,
      fetchDocument: func.isRequired,
      fetchPortal: func.isRequired,
      overrideBreadcrumbs: func.isRequired,
      pushWindowPath: func.isRequired,
      searchDialectUpdate: func,
    }
    static defaultProps = {
      searchDialectUpdate: () => {},
    }
    constructor(props) {
      super(props)
      // NOTE: Techinque for filtering out props that don't need to be passed down to children
      // eslint-disable-next-line
      const { dispatch, ...propsToPassAlong } = props
      this.state = {
        propsToPassAlong,
      }
    }

    componentDidMount() {
      const { routeParams, computeDocument } = this.props

      // Document
      ProviderHelpers.fetchIfMissing(
        routeParams.dialect_path + '/Dictionary',
        this.props.fetchDocument,
        computeDocument
      )
    }

    async componentDidUpdate(prevProps) {
      const { routeParams, computeDocument, computeDialect2, computeLogin } = this.props
      const prevComputeDocument = ProviderHelpers.getEntry(
        prevProps.computeDocument,
        `${routeParams.dialect_path}/Dictionary`
      )
      const curComputeDocument = ProviderHelpers.getEntry(computeDocument, `${routeParams.dialect_path}/Dictionary`)
      const curAction = selectn('action', curComputeDocument)
      const prevAction = selectn('action', prevComputeDocument)
      if (curAction !== prevAction && curAction === 'FV_DOCUMENT_FETCH_SUCCESS') {
        const uid = selectn('response.uid', curComputeDocument)
        const data = await this.getPhrases({ uid })

        const computedDialect2 = ProviderHelpers.getEntry(computeDialect2, routeParams.dialect_path)
        const computedDialect2Response = selectn('response', computedDialect2)

        this.setState({
          uid,
          dictionaryListItems: selectn('entries', data),
          dictionaryListHeaders: getColumnsPhrases({
            computedDialect2Response,
            DEFAULT_LANGUAGE: 'english',
            computeLogin,
            routeParams,
          }),
        })
      }
    }

    render() {
      return (
        <Component
          dictionaryListItems={this.state.dictionaryListItems}
          dictionaryListHeaders={this.state.dictionaryListHeaders}
          uid={this.state.uid}
          {...this.state.propsToPassAlong}
        />
      )
    }

    getPhrases = async ({
      currentPageIndex = 1,
      pageSize = 10,
      sortOrder = 'asc',
      sortBy = 'fv:custom_order',
      uid,
    }) => {
      const currentAppliedFilter = ''
      // WORKAROUND: DY @ 17-04-2019 - Mark this query as a "starts with" query. See DirectoryOperations.js for note
      const startsWithQuery = ProviderHelpers.isStartsWithQuery(currentAppliedFilter)
      const nql = `${currentAppliedFilter}&currentPageIndex=${currentPageIndex -
        1}&pageSize=${pageSize}&sortOrder=${sortOrder}&sortBy=${sortBy}&enrichment=category_children${startsWithQuery}`

      await this.props.fetchPhrases(uid, nql)
      return selectn('response', ProviderHelpers.getEntry(this.props.computePhrases, uid))
    }
  }
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
