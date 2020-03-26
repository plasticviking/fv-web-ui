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

      const currentAppliedFilter = ''
      // WORKAROUND: DY @ 17-04-2019 - Mark this query as a "starts with" query. See DirectoryOperations.js for note
      const startsWithQuery = ProviderHelpers.isStartsWithQuery(currentAppliedFilter)
      const nql = `${currentAppliedFilter}&currentPageIndex=${1 -
        1}&pageSize=${10}&sortOrder=${'asc'}&sortBy=${'fv:custom_order'}&enrichment=category_children${startsWithQuery}`

      await this.props.fetchWords(uid, nql)
      const data = selectn('response', ProviderHelpers.getEntry(this.props.computeWords, uid))

      const { computeDialect2, computeLogin, routeParams } = this.props
      const computedDialect2 = ProviderHelpers.getEntry(computeDialect2, routeParams.dialect_path)
      const computedDialect2Response = selectn('response', computedDialect2)
      const columns = getColumnsWords({
        computedDialect2Response,
        DEFAULT_LANGUAGE: 'english',
        computeLogin,
        routeParams,
      })

      const childrenWithExtraProps = React.Children.map(this.props.children, (child) => {
        return React.cloneElement(child, {
          entityType: selectn('entity-type', data),
          isPaginable: selectn('isPaginable', data),
          resultsCount: selectn('resultsCount', data),
          pageSize: selectn('pageSize', data),
          maxPageSize: selectn('maxPageSize', data),
          resultsCountLimit: selectn('resultsCountLimit', data),
          currentPageSize: selectn('currentPageSize', data),
          currentPageIndex: selectn('currentPageIndex', data),
          currentPageOffset: selectn('currentPageOffset', data),
          numberOfPages: selectn('numberOfPages', data),
          isPreviousPageAvailable: selectn('isPreviousPageAvailable', data),
          isNextPageAvailable: selectn('isNextPageAvailable', data),
          isLastPageAvailable: selectn('isLastPageAvailable', data),
          isSortable: selectn('isSortable', data),
          hasError: selectn('hasError', data),
          errorMessage: selectn('errorMessage', data),
          totalSize: selectn('totalSize', data),
          pageIndex: selectn('pageIndex', data),
          pageCount: selectn('pageCount', data),
          // DictionaryList
          entries: selectn('entries', data), // entries used as items in DictionaryList
          columns,
        })
      })
      this.setState({
        childrenWithExtraProps,
      })
    }
  }

  render() {
    return this.state.childrenWithExtraProps
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
