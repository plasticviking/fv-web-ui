import React, { Suspense } from 'react'
import WordsContainer from './wordsContainer'
import PropTypes from 'prop-types'

const DictionaryList = React.lazy(() => import('views/components/Browsing/DictionaryList'))

// TODO
// √ - render list of items
// - paginate
// - change per page
class WordsList extends React.Component {
  constructor(props) {
    super(props)
  }
  render() {
    return (
      <Suspense fallback={<div>Loading...</div>}>
        <DictionaryList items={this.props.entries} columns={this.props.columns} />
      </Suspense>
    )
  }
}

// PROPTYPES
// -------------------------------------------
const { array } = PropTypes
WordsList.propTypes = {
  columns: array,
  entries: array,
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
