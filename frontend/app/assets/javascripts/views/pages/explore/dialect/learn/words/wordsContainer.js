import React from 'react'

// REDUX
import { connect } from 'react-redux'
// REDUX: actions/dispatch/func
import { fetchWords } from 'providers/redux/reducers/fvWord'
import { fetchDocument } from 'providers/redux/reducers/document'

import selectn from 'selectn'
import ProviderHelpers from 'common/ProviderHelpers'
import PropTypes from 'prop-types'

import { getColumnsWords } from './wordsColumns'

class WordsContainer extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      data: [],
      childrenWithExtraProps: <div>GETTING DATA, PREPARING DATA</div>,
    }
  }

  componentDidMount() {
    // Document
    ProviderHelpers.fetchIfMissing(
      this.props.routeParams.dialect_path + '/Dictionary',
      this.props.fetchDocument,
      this.props.computeDocument
    )
  }

  async componentDidUpdate(prevProps) {
    const prevComputeDocument = ProviderHelpers.getEntry(
      prevProps.computeDocument,
      `${this.props.routeParams.dialect_path}/Dictionary`
    )
    const curComputeDocument = ProviderHelpers.getEntry(
      this.props.computeDocument,
      `${this.props.routeParams.dialect_path}/Dictionary`
    )
    const curAction = selectn('action', curComputeDocument)
    const prevAction = selectn('action', prevComputeDocument)
    if (curAction !== prevAction && curAction === 'FV_DOCUMENT_FETCH_SUCCESS') {
      const uid = selectn('response.uid', curComputeDocument)
      const data = await this.getWords({ uid })
      this.enhanceChildren({ data, uid })
    }
  }

  render() {
    return this.state.childrenWithExtraProps
  }

  enhanceChildren = ({ data, uid }) => {
    const columns = this.getColumns()
    const pageSize = selectn('pageSize', data)
    const childrenWithExtraProps = React.Children.map(this.props.children, (child) => {
      return React.cloneElement(child, {
        currentPageIndex: selectn('currentPageIndex', data),
        currentPageOffset: selectn('currentPageOffset', data),
        currentPageSize: selectn('currentPageSize', data),
        entityType: selectn('entity-type', data),
        errorMessage: selectn('errorMessage', data),
        hasError: selectn('hasError', data),
        isLastPageAvailable: selectn('isLastPageAvailable', data),
        isNextPageAvailable: selectn('isNextPageAvailable', data),
        isPaginable: selectn('isPaginable', data),
        isPreviousPageAvailable: selectn('isPreviousPageAvailable', data),
        isSortable: selectn('isSortable', data),
        maxPageSize: selectn('maxPageSize', data),
        numberOfPages: selectn('numberOfPages', data),
        pageCount: selectn('pageCount', data),
        pageIndex: selectn('pageIndex', data),
        pageSize,
        resultsCount: selectn('resultsCount', data),
        resultsCountLimit: selectn('resultsCountLimit', data),
        totalSize: selectn('totalSize', data),
        // DictionaryList
        entries: selectn('entries', data), // entries used as items in DictionaryList
        columns,
        uid,
        handlePagination: this.handlePagination,
      })
    })
    this.setState({
      childrenWithExtraProps,
      pageSize,
    })
  }
  getColumns = () => {
    const { computeDialect2, computeLogin, routeParams } = this.props
    const computedDialect2 = ProviderHelpers.getEntry(computeDialect2, routeParams.dialect_path)
    const computedDialect2Response = selectn('response', computedDialect2)
    return getColumnsWords({
      computedDialect2Response,
      DEFAULT_LANGUAGE: 'english',
      computeLogin,
      routeParams,
    })
  }
  getWords = async ({ currentPageIndex = 1, pageSize = 10, sortOrder = 'asc', sortBy = 'fv:custom_order', uid }) => {
    const currentAppliedFilter = ''
    // WORKAROUND: DY @ 17-04-2019 - Mark this query as a "starts with" query. See DirectoryOperations.js for note
    const startsWithQuery = ProviderHelpers.isStartsWithQuery(currentAppliedFilter)
    const nql = `${currentAppliedFilter}&currentPageIndex=${currentPageIndex -
      1}&pageSize=${pageSize}&sortOrder=${sortOrder}&sortBy=${sortBy}&enrichment=category_children${startsWithQuery}`

    await this.props.fetchWords(uid, nql)
    return selectn('response', ProviderHelpers.getEntry(this.props.computeWords, uid))
  }
  handlePagination = async ({ currentPageIndex, pageSize, sortOrder, sortBy, uid }) => {
    let _currentPageIndex = currentPageIndex
    if (this.state.pageSize !== pageSize) {
      _currentPageIndex = 1
    }
    const data = await this.getWords({
      currentPageIndex: _currentPageIndex,
      pageSize,
      sortOrder,
      sortBy,
      uid,
    })
    this.enhanceChildren({ data, uid })
  }
}

// PROPTYPES
// -------------------------------------------
const { any, func, object } = PropTypes
WordsContainer.propTypes = {
  children: any,
  // REDUX: reducers/state
  computeDialect2: object.isRequired,
  computeLogin: object.isRequired,
  computeWords: object.isRequired,
  computeDocument: object.isRequired,
  routeParams: object.isRequired,
  // REDUX: actions/dispatch/func
  fetchWords: func.isRequired,
  fetchDocument: func.isRequired,
}

// REDUX: reducers/state
const mapStateToProps = (state) => {
  const { document, fvDialect, fvWord, navigation, nuxeo } = state
  const { computeDialect2 } = fvDialect
  const { computeDocument } = document
  const { computeLogin } = nuxeo
  const { computeWords } = fvWord
  const { route } = navigation
  return {
    computeDialect2,
    computeDocument,
    computeLogin,
    computeWords,
    routeParams: route.routeParams,
  }
}

// REDUX: actions/dispatch/func
const mapDispatchToProps = {
  fetchWords,
  fetchDocument,
}

export default connect(mapStateToProps, mapDispatchToProps)(WordsContainer)
