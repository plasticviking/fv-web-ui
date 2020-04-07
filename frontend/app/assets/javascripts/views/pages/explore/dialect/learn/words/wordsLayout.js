import React, { Component, Suspense } from 'react'
import WordsData from './wordsData'
import WordsDataHooks from './wordsDataHooks'
import IntlService from 'views/services/intl'
import {
  // dictionaryListSmallScreenColumnDataTemplate,
  // dictionaryListSmallScreenColumnDataTemplateCustomInspectChildrenCellRender,
  // dictionaryListSmallScreenColumnDataTemplateCustomAudio,
  dictionaryListSmallScreenTemplateWords,
} from 'views/components/Browsing/DictionaryListSmallScreen'
import AuthorizationFilter from 'views/components/Document/AuthorizationFilter'
import FVButton from 'views/components/FVButton'
import withPagination from 'views/hoc/grid-list/with-pagination'

const intl = IntlService.instance
const AlphabetListView = React.lazy(() => import('views/components/AlphabetListView'))
const DialectFilterList = React.lazy(() => import('views/components/DialectFilterList'))
// For DialectFilterList
const DictionaryList = React.lazy(() => import('views/components/Browsing/DictionaryList'))
const SearchDialect = React.lazy(() => import('views/components/SearchDialect'))
const FlashcardList = React.lazy(() => import('views/components/Browsing/flashcard-list'))
const ExportDialect = React.lazy(() => import('views/components/ExportDialect'))

import {
  VIEWMODE_DEFAULT,
  VIEWMODE_FLASHCARD,
  // VIEWMODE_SMALL_SCREEN,
  // VIEWMODE_LARGE_SCREEN,
} from 'views/components/Browsing//DictionaryListCommon'

class WordsLayout extends Component {
  render() {
    // console.log('WordsDataHooks', WordsDataHooks())
    return (
      <WordsData>
        {({
          // Portal
          dialectDcTitle,
          dialectClassName,
          // Document
          // documentUid,
          // Category
          categoryList,
          categorySelected,
          categoryClearDialectFilter,
          categoryFacetField,
          categoryFilterInfo,
          categoryHandleCategoryClick,
          categoryHandleDialectFilterList,
          categoryCategory,
          categoryPhraseBook,
          // Alphabet
          characters,
          letter,
          handleAlphabetClick,
          // Words
          listViewSetListViewMode,
          listViewItems,
          listViewColumns,
          listViewMode,
          listViewDialect,
          listViewHandleSearch,
          listViewResetSearch,
          listViewFetcher,
          listViewMetadata,
          // MISC
          page,
          pageSize,
          pushWindowPath,
          routeParams,
          search,
          setRouteParams,
          sortBy,
          sortOrder,
          splitWindowPath,
        }) => {
          const FlashcardsWithPagination = withPagination(FlashcardList, 10)
          const childFlashcardList = <FlashcardsWithPagination flashcardTitle={dialectDcTitle} />
          return (
            <div style={{ display: 'flex' }}>
              <div style={{ maxWidth: '25%' }}>
                <WordsDataHooks>
                  {({ searchParamsTesting, routeParamsSet }) => {
                    return (
                      <>
                        <h2>DataComponents working with DataSourceComponents</h2>
                        <div>
                          <h3>{'Redux > navigation > route > search > testing'}</h3>
                          <p>{searchParamsTesting || '(not set)'}</p>
                        </div>
                        <button
                          onClick={() => {
                            routeParamsSet({ search: { testing: '👋' } })
                          }}
                        >
                          {'Click to Update `testing`'}
                        </button>
                      </>
                    )
                  }}
                </WordsDataHooks>
                {characters && (
                  <Suspense fallback={<div>Loading...</div>}>
                    <AlphabetListView
                      characters={characters}
                      dialectClassName={dialectClassName}
                      handleClick={handleAlphabetClick}
                      letter={letter}
                      splitWindowPath={splitWindowPath}
                    />
                  </Suspense>
                )}
                {characters && (
                  <Suspense fallback={<div>Loading...</div>}>
                    <DialectFilterList
                      appliedFilterIds={categorySelected}
                      clearDialectFilter={categoryClearDialectFilter}
                      facets={categoryList}
                      facetField={categoryFacetField}
                      filterInfo={categoryFilterInfo}
                      handleDialectFilterClick={categoryHandleCategoryClick}
                      handleDialectFilterList={categoryHandleDialectFilterList}
                      routeParams={routeParams}
                      title={intl.trans(
                        'views.pages.explore.dialect.learn.words.browse_by_category',
                        'Browse Categories',
                        'words'
                      )}
                      type={'words'}
                      splitWindowPath={splitWindowPath}
                      pushWindowPath={pushWindowPath}
                      categoryCategory={categoryCategory}
                      categoryPhraseBook={categoryPhraseBook}
                    />
                  </Suspense>
                )}
              </div>
              <div style={{ flexGrow: 1, flexShrink: 0 }}>
                {listViewItems && (
                  <Suspense fallback={<div>Loading...</div>}>
                    <DictionaryList
                      dictionaryListClickHandlerViewMode={listViewSetListViewMode}
                      dictionaryListViewMode={listViewMode}
                      dictionaryListSmallScreenTemplate={dictionaryListSmallScreenTemplateWords}
                      dialect={listViewDialect}
                      // ==================================================
                      // Table data
                      // --------------------------------------------------
                      items={listViewItems}
                      columns={listViewColumns}
                      // ===============================================
                      // Pagination
                      // -----------------------------------------------
                      fetcher={listViewFetcher}
                      fetcherParams={{ currentPageIndex: routeParams.page, pageSize: routeParams.pageSize }}
                      metadata={listViewMetadata}
                      // ===============================================
                      // ==================================================
                      // Search
                      // --------------------------------------------------
                      childSearchDialect={
                        <Suspense fallback={<div>Loading...</div>}>
                          <SearchDialect
                            handleSearch={listViewHandleSearch}
                            resetSearch={listViewResetSearch}
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
                            // searchDialectDataType={props.searchDialectDataType}
                          />
                        </Suspense>
                      }
                      // ==================================================
                      // Flashcards
                      // --------------------------------------------------
                      childFlashcardList={childFlashcardList}
                      // ==================================================
                      // ExportDialect
                      // --------------------------------------------------
                      childExportDialect={
                        <AuthorizationFilter filter={{ permission: 'Write', entity: listViewDialect }}>
                          <Suspense fallback={<div>Loading...</div>}>
                            <ExportDialect
                            // exportDialectColumns={exportDialectColumns}
                            // exportDialectExportElement={exportDialectExportElement}
                            // exportDialectLabel={exportDialectLabel}
                            // exportDialectQuery={exportDialectQuery}
                            />
                          </Suspense>
                        </AuthorizationFilter>
                      }
                      // ==================================================
                      // View Mode Buttons
                      // --------------------------------------------------
                      childViewModeButtons={
                        listViewMode === VIEWMODE_FLASHCARD ? (
                          <FVButton
                            variant="contained"
                            color="primary"
                            className="DictionaryList__viewModeButton"
                            onClick={() => {
                              listViewSetListViewMode(VIEWMODE_DEFAULT)
                            }}
                          >
                            Cancel flashcard view
                          </FVButton>
                        ) : (
                          <FVButton
                            variant="contained"
                            className="DictionaryList__viewModeButton"
                            onClick={() => {
                              listViewSetListViewMode(VIEWMODE_FLASHCARD)
                            }}
                          >
                            Flashcard view
                          </FVButton>
                        )
                      }
                      pushWindowPath={pushWindowPath}
                      routeParams={routeParams}
                      page={page}
                      pageSize={pageSize}
                      search={search}
                      setRouteParams={setRouteParams}
                      sortBy={sortBy}
                      sortOrder={sortOrder}
                    />
                  </Suspense>
                )}
              </div>
            </div>
          )
        }}
      </WordsData>
    )
  }
}
export default WordsLayout
