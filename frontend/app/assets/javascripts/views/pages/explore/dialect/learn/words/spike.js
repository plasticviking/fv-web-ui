import React, { Suspense } from 'react'
import WordsContainer from './wordsContainer'
import PropTypes from 'prop-types'

import withPagination from 'views/hoc/grid-list/with-pagination'
const DictionaryList = React.lazy(() => import('views/components/Browsing/DictionaryList'))
const DictionaryListWithPagination = withPagination(DictionaryList, 10)
// TODO
// √ - render list of items
// √ - paginate
// √ - change per page
class WordsList extends React.Component {
  constructor(props) {
    super(props)
  }
  render() {
    return (
      <Suspense fallback={<div>Loading...</div>}>
        <DictionaryListWithPagination
          dictionaryListItems={this.props.entries}
          dictionaryListHeaders={this.props.columns}
          paginationEventHandler={({ paginationCurrentPageIndex, paginationPageSize }) => {
            this.props.handlePagination({
              currentPageIndex: paginationCurrentPageIndex,
              pageSize: paginationPageSize,
              uid: this.props.uid,
            })
          }}
          paginationCurrentPageIndex={this.props.pageIndex + 1}
          paginationPageSize={this.props.pageSize}
          paginationResultsCount={this.props.resultsCount}
          paginationPageCount={this.props.numberOfPages} // TODO: CAN BE CALCULATED
        />
      </Suspense>
    )
  }
}

// PROPTYPES
// -------------------------------------------
const { array, func, string, number } = PropTypes
WordsList.propTypes = {
  columns: array,
  entries: array,
  handlePagination: func,
  numberOfPages: number,
  pageIndex: number,
  pageSize: number,
  resultsCount: number,
  uid: string,
}
WordsList.defaultProps = {
  entries: [],
}
class WordsSpike extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <WordsContainer>
        <WordsList />
      </WordsContainer>
    )
  }
}

export default WordsSpike
