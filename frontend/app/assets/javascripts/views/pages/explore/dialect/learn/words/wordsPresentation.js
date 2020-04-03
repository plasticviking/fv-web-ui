import React, { Component, Suspense } from 'react'
import PropTypes from 'prop-types'
const DictionaryList = React.lazy(() => import('views/components/Browsing/DictionaryList'))
class WordsPresentation extends Component {
  render() {
    const {
      // Portal
      dialectDcTitle,
      // dialectClassName,
      // Document
      documentUid,
      // Category
      // categories,
      // Alphabet
      // characters,
      // Words
      words,
      columns,
    } = this.props
    return (
      <div>
        <h2>WordsPresentation</h2>
        {dialectDcTitle && (
          <h3>
            {dialectDcTitle} {documentUid && `(${documentUid})`}
          </h3>
        )}
        {words && (
          <Suspense fallback={<div>Loading...</div>}>
            <DictionaryList
              // dictionaryListClickHandlerViewMode={this.props.setListViewMode}
              // dictionaryListViewMode={listView.mode}
              // dictionaryListSmallScreenTemplate={dictionaryListSmallScreenTemplateWords}
              // flashcardTitle={pageTitle}
              // dialect={computedDialect2Response}
              // ==================================================
              // Search
              // --------------------------------------------------
              // handleSearch={this.handleSearch}
              // resetSearch={this.resetSearch}
              // hasSearch
              searchUi={[
                {
                  defaultChecked: true,
                  idName: 'searchByTitle',
                  labelText: 'Word',
                },
                {
                  defaultChecked: true,
                  idName: 'searchByDefinitions',
                  labelText: 'Definitions',
                },
                {
                  idName: 'searchByTranslations',
                  labelText: 'Literal translations',
                },
                {
                  type: 'select',
                  idName: 'searchPartOfSpeech',
                  labelText: 'Parts of speech:',
                },
              ]}
              // ==================================================
              // Table data
              // --------------------------------------------------
              items={words}
              columns={columns}
              // ===============================================
              // Pagination
              // -----------------------------------------------
              // hasPagination
              // fetcher={({ currentPageIndex, pageSize }) => {
              //   const newUrl = appendPathArrayAfterLandmark({
              //     pathArray: [pageSize, currentPageIndex],
              //     splitWindowPath,
              //     landmarkArray: [routeParams.category],
              //   })
              //   NavigationHelpers.navigate(`/${newUrl}`, this.props.pushWindowPath)
              // }}
              // fetcherParams={{ currentPageIndex: routeParams.page, pageSize: routeParams.pageSize }}
              // metadata={selectn('response', computedWords)}
              // ===============================================
              // Sort
              // -----------------------------------------------
              // sortHandler={this._sortHandler}
              // ===============================================
            />
          </Suspense>
        )}
      </div>
    )
  }
}
const { string } = PropTypes
WordsPresentation.propTypes = {
  dialectDcTitle: string,
  documentUid: string,
}
// WordsPresentation.defaultProps = {
//   dialectDcTitle: '',
//   documentUid: '',
// }
export default WordsPresentation
