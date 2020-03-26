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
          items={this.props.entries}
          columns={this.props.columns}
          fetcher={(fetcherParams) => {
            const { currentPageIndex, pageSize } = fetcherParams
            this.props.handlePagination({ currentPageIndex, pageSize, uid: this.props.uid })
          }}
          fetcherParams={{ currentPageIndex: this.props.pageIndex + 1, pageSize: this.props.pageSize }}
          metadata={{
            resultsCount: this.props.resultsCount,
            pageCount: this.props.numberOfPages,
          }}
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
