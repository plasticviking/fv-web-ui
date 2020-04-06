/* Copyright 2016 First People's Cultural Council

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

// 3rd party
// -------------------------------------------
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { is, Map, Set } from 'immutable'
// REDUX
import { connect } from 'react-redux'
// REDUX: actions/dispatch/func
import { fetchCategories } from 'providers/redux/reducers/fvCategory'
import { fetchCharacters } from 'providers/redux/reducers/fvCharacter'
import { fetchDocument } from 'providers/redux/reducers/document'
import { fetchPortal } from 'providers/redux/reducers/fvPortal'
import { fetchWords } from 'providers/redux/reducers/fvWord'
import { pushWindowPath } from 'providers/redux/reducers/windowPath'
import { searchDialectUpdate } from 'providers/redux/reducers/searchDialect'
import { setListViewMode } from 'providers/redux/reducers/listView'
import { setRouteParams, updatePageProperties } from 'providers/redux/reducers/navigation'
// -------------------------------------------
import {
  dictionaryListSmallScreenColumnDataTemplate,
  dictionaryListSmallScreenColumnDataTemplateCustomInspectChildrenCellRender,
  dictionaryListSmallScreenColumnDataTemplateCustomAudio,
  // dictionaryListSmallScreenTemplateWords,
} from 'views/components/Browsing/DictionaryListSmallScreen'
import { WORKSPACES } from 'common/Constants'
import FVButton from 'views/components/FVButton'
import Edit from '@material-ui/icons/Edit'
import Link from 'views/components/Link'
import Preview from 'views/components/Editor/Preview'
import UIHelpers from 'common/UIHelpers'
import AuthorizationFilter from 'views/components/Document/AuthorizationFilter'
import NavigationHelpers, {
  getSearchObject,
  appendPathArrayAfterLandmark,
  routeHasChanged,
} from 'common/NavigationHelpers'
import IntlService from 'views/services/intl'
import ProviderHelpers from 'common/ProviderHelpers'
import selectn from 'selectn'
import { getDialectClassname } from 'views/pages/explore/dialect/helpers'
import {
  getCategoriesOrPhrasebooks,
  getCharacters,
  handleDialectFilterList,
  //   onNavigateRequest,
  sortHandler,
  updateFilter,
  updateUrlAfterResetSearch,
  updateUrlIfPageOrPageSizeIsDifferent,
  useIdOrPathFallback,
} from 'views/pages/explore/dialect/learn/base'
import {
  SEARCH_BY_ALPHABET,
  SEARCH_BY_CATEGORY,
  SEARCH_PART_OF_SPEECH_ANY,
} from 'views/components/SearchDialect/constants'
const intl = IntlService.instance

// WordsData
// ====================================================
/*
read: login info
read: alphabet data ~
read: category data ~
read, get: words data
    - filtered by *
    - page, per page
    - sort by
*/
class WordsData extends Component {
  constructor(props, context) {
    super(props, context)

    const { properties, routeParams } = props

    let filterInfo = this.initialFilterInfo()

    // If no filters are applied via URL, use props
    if (filterInfo.get('currentCategoryFilterIds').isEmpty()) {
      const pagePropertiesFilterInfo = selectn(
        [[`${routeParams.area}_${routeParams.dialect_name}_learn_words`], 'filterInfo'],
        properties.pageProperties
      )
      if (pagePropertiesFilterInfo) {
        filterInfo = pagePropertiesFilterInfo
      }
    }
    this.state = {
      filterInfo,
    }
  }
  // NOTE: need to wait for fetchDocument to finish before calling fetchListViewData.
  // Within fetchListViewData there's a 'helper' function that will return a dialect path or id pulled from computeDocument
  // if we don't wait for fetchDocument, the helper will return a dialect path, this works UNTIL
  // a re-render happens and we then have id within computeDocument, and when we try to extract the data from computeDocument
  // the providerHelper can't find it becuause it's using an ID to find a path.
  async componentDidMount() {
    const { computeDocument, computeCharacters, computePortal, computeCategories, routeParams } = this.props
    // Portal
    await ProviderHelpers.fetchIfMissing(`${routeParams.dialect_path}/Portal`, this.props.fetchPortal, computePortal)
    // Document
    await ProviderHelpers.fetchIfMissing(
      `${routeParams.dialect_path}/Dictionary`,
      this.props.fetchDocument,
      computeDocument
    )

    // Category
    await ProviderHelpers.fetchIfMissing(
      `/api/v1/path/FV/${routeParams.area}/SharedData/Shared Categories/@children`,
      this.props.fetchCategories,
      computeCategories
    )
    // Alphabet
    await ProviderHelpers.fetchIfMissing(
      `${routeParams.dialect_path}/Alphabet`,
      this.props.fetchCharacters,
      computeCharacters,
      '&currentPageIndex=0&pageSize=100&sortOrder=asc&sortBy=fvcharacter:alphabet_order'
    )

    // NOTE: MOVING URL PARAMS INTO REDUX STORE
    // ==============================================================================
    // If window.location.search has sortOrder & sortBy,
    // Ensure the same values are in redux
    // before generating the sort markup
    const windowLocationSearch = getSearchObject()
    const windowLocationSearchSortOrder = windowLocationSearch.sortOrder
    const windowLocationSearchSortBy = windowLocationSearch.sortBy
    const storeSortBy = selectn('sortBy', this.props.navigationRouteSearch)
    const storeSortOrder = selectn('sortOrder', this.props.navigationRouteSearch)

    if (
      windowLocationSearchSortOrder &&
      windowLocationSearchSortBy &&
      (storeSortOrder !== windowLocationSearchSortOrder || storeSortBy !== windowLocationSearchSortBy)
    ) {
      this.props.setRouteParams({
        search: {
          pageIndex: this.props.routeParams.page,
          pageSize: this.props.routeParams.pageSize,
          sortBy: windowLocationSearchSortBy,
          sortOrder: windowLocationSearchSortOrder,
        },
      })
    }

    // Words
    this.fetchListViewData()
  }
  componentDidUpdate(prevProps) {
    if (
      routeHasChanged({
        prevWindowPath: prevProps.windowPath,
        curWindowPath: this.props.windowPath,
        prevRouteParams: prevProps.routeParams,
        curRouteParams: this.props.routeParams,
      })
    ) {
      this.fetchListViewData({ pageIndex: this.props.routeParams.page, pageSize: this.props.routeParams.pageSize })
    }
  }

  render() {
    const {
      children,
      computeCategories,
      computeCharacters,
      computeDialect2,
      computeDocument,
      computePortal,
      listView,
      navigationRouteSearch,
      routeParams,
    } = this.props

    const computedPortal = ProviderHelpers.getEntry(computePortal, `${routeParams.dialect_path}/Portal`)
    const dialectDcTitle = selectn('response.contextParameters.ancestry.dialect.dc:title', computedPortal)
    const dialectClassName = getDialectClassname(computedPortal)

    const computedDocument = ProviderHelpers.getEntry(computeDocument, `${routeParams.dialect_path}/Dictionary`)
    const computedDocumentUid = selectn('response.uid', computedDocument)
    /*
    <AuthorizationFilter
    filter={{
    entity: selectn('response', computedDocument),
    login: computeLogin,
    role: ['Record', 'Approve', 'Everything'],
    }}
    hideFromSections
    routeParams={routeParams}
    >
    */
    // TODO: EXTRACT MINIMAL CATEGORIES DATA
    const categoryList = getCategoriesOrPhrasebooks({
      getEntryId: `/api/v1/path/FV/${routeParams.area}/SharedData/Shared Categories/@children`,
      computeCategories,
    })
    const categoryFacetField = ProviderHelpers.switchWorkspaceSectionKeys('fv-word:categories', routeParams.area)
    // TODO: EXTRACT MINIMAL CHARACTER DATA
    const characters = getCharacters({
      computeCharacters,
      routeParamsDialectPath: routeParams.dialect_path,
    })

    // Words
    const computedWords = ProviderHelpers.getEntry(this.props.computeWords, computedDocumentUid)
    const words = selectn('response.entries', computedWords)
    const computedDialect2 = ProviderHelpers.getEntry(computeDialect2, routeParams.dialect_path)
    const computedDialect2Response = selectn('response', computedDialect2)

    return children({
      // Portal
      dialectDcTitle,
      dialectClassName,
      // Document
      documentUid: computedDocumentUid,
      // Category
      categoryList,
      categorySelected: new Set([routeParams.category]),
      categoryClearDialectFilter: this.clearDialectFilter,
      categoryFacetField,
      categoryFilterInfo: this.state.filterInfo,
      categoryHandleCategoryClick: this.handleCategoryClick,
      categoryHandleDialectFilterList: this.categoryHandleDialectFilterList,
      categoryCategory: routeParams.category,
      categoryPhraseBook: routeParams.phraseBook,
      // Alphabet
      characters,
      letter: selectn('letter', routeParams),
      handleAlphabetClick: this.handleAlphabetClick,
      // Words
      listViewItems: words,
      listViewColumns: this.getColumns(),
      listViewSetListViewMode: this.props.setListViewMode,
      listViewMode: listView.mode,
      listViewDialect: computedDialect2Response,
      listViewHandleSearch: this.listViewHandleSearch,
      listViewResetSearch: this.listViewResetSearch,
      listViewFetcher: this.listViewFetcher,
      listViewMetadata: selectn('response', computedWords),
      listViewSortHandler: this.listViewSortHandler,
      // Misc
      page: this.props.routeParams.page,
      pageSize: this.props.routeParams.pageSize,
      pushWindowPath: this.props.pushWindowPath,
      routeParams: this.props.routeParams,
      search: navigationRouteSearch,
      setRouteParams: this.props.setRouteParams,
      sortBy: selectn('sortBy', navigationRouteSearch),
      sortOrder: selectn('sortOrder', navigationRouteSearch),
      splitWindowPath: this.props.splitWindowPath,
    })
  }
  // =============================================
  // CATEGORIES
  // =============================================
  clearDialectFilter = () => {
    this.setState({ filterInfo: this.initialFilterInfo() })
  }

  initialFilterInfo = () => {
    const { routeParams } = this.props
    const routeParamsCategory = routeParams.category
    const initialCategories = routeParamsCategory ? new Set([routeParamsCategory]) : new Set()
    const currentAppliedFilterCategoriesParam1 = ProviderHelpers.switchWorkspaceSectionKeys(
      'fv-word:categories',
      routeParams.area
    )
    const currentAppliedFilterCategories = routeParamsCategory
      ? ` AND ${currentAppliedFilterCategoriesParam1}/* IN ("${routeParamsCategory}")`
      : ''

    return new Map({
      currentCategoryFilterIds: initialCategories,
      currentAppliedFilter: new Map({
        categories: currentAppliedFilterCategories,
      }),
    })
  }

  handleCategoryClick = async ({ facetField, selected, unselected }) => {
    await this.props.searchDialectUpdate({
      searchByAlphabet: '',
      searchByMode: SEARCH_BY_CATEGORY,
      searchBySettings: {
        searchByTitle: true,
        searchByDefinitions: false,
        searchByTranslations: false,
        searchPartOfSpeech: SEARCH_PART_OF_SPEECH_ANY,
      },
      searchingDialectFilter: selected.checkedFacetUid,
      searchTerm: '',
    })

    this.changeFilter()

    this.handleDialectFilterChange({
      facetField,
      selected,
      type: this.DIALECT_FILTER_TYPE,
      unselected,
    })
  }

  handleDialectFilterChange = ({ facetField, selected, type, unselected, shouldResetUrlPagination }) => {
    const { filterInfo } = this.state
    const { routeParams, splitWindowPath } = this.props

    const newFilter = handleDialectFilterList({
      facetField,
      selected,
      type,
      unselected,
      routeParams,
      filterInfo,
    })

    // When facets change, pagination should be reset.
    // In these pages (words/phrase), list views are controlled via URL
    if (shouldResetUrlPagination === true) {
      updateUrlIfPageOrPageSizeIsDifferent({
        // pageSize, // TODO ?
        // preserveSearch, // TODO ?
        pushWindowPath: this.props.pushWindowPath,
        routeParams: routeParams,
        splitWindowPath: splitWindowPath,
      })
    }

    this.setState({ filterInfo: newFilter })
  }
  categoryHandleDialectFilterList = (facetFieldParam, selected, unselected, type, shouldResetUrlPagination) => {
    this.handleDialectFilterChange({
      facetField: facetFieldParam,
      selected,
      type,
      unselected,
      routeParams: this.props.routeParams,
      filterInfo: this.state.filterInfo,
      shouldResetUrlPagination,
    })
  }
  // =============================================
  // LISTVIEW
  // =============================================
  fetchListViewData({ pageIndex = 1, pageSize = 10 } = {}) {
    const { computeDocument, navigationRouteSearch, routeParams } = this.props

    let currentAppliedFilter = ''
    if (routeParams.category) {
      // Private
      if (routeParams.area === 'Workspaces') {
        currentAppliedFilter = ` AND fv-word:categories/* IN ("${routeParams.category}")`
      }
      // Public
      if (routeParams.area === 'sections') {
        currentAppliedFilter = ` AND fvproxy:proxied_categories/* IN ("${routeParams.category}")`
      }
    }

    // WORKAROUND: DY @ 17-04-2019 - Mark this query as a "starts with" query. See DirectoryOperations.js for note
    const startsWithQuery = ProviderHelpers.isStartsWithQuery(currentAppliedFilter)

    const searchObj = getSearchObject()
    // 1st: redux values, 2nd: url search query, 3rd: defaults
    const sortOrder = navigationRouteSearch.sortOrder || searchObj.sortOrder || this.DEFAULT_SORT_TYPE
    const sortBy = navigationRouteSearch.sortBy || searchObj.sortBy || this.DEFAULT_SORT_COL
    const computedDocument = ProviderHelpers.getEntry(computeDocument, `${routeParams.dialect_path}/Dictionary`)

    // NOTE: see information over at `componentDidMount` regarding this bug causing useIdOrPathFallback
    // Pulling out data will fail if this funciton first uses a path and then an id
    const uid = useIdOrPathFallback({ id: selectn('response.uid', computedDocument), routeParams })
    const nql = `${currentAppliedFilter}&currentPageIndex=${pageIndex -
      1}&pageSize=${pageSize}&sortOrder=${sortOrder}&sortBy=${sortBy}&enrichment=category_children${startsWithQuery}`
    this.props.fetchWords(uid, nql)
  }

  getColumns = () => {
    const { computeDialect2, DEFAULT_LANGUAGE, computeLogin, routeParams } = this.props

    const computedDialect2 = ProviderHelpers.getEntry(computeDialect2, routeParams.dialect_path)
    const computedDialect2Response = selectn('response', computedDialect2)
    const columns = [
      {
        name: 'title',
        title: intl.trans('word', 'Word', 'first'),
        columnDataTemplate: dictionaryListSmallScreenColumnDataTemplate.cellRender,
        render: (v, data) => {
          const isWorkspaces = routeParams.area === WORKSPACES
          const href = NavigationHelpers.generateUIDPath(routeParams.siteTheme, data, 'words')
          const hrefEdit = NavigationHelpers.generateUIDEditPath(routeParams.siteTheme, data, 'words')
          const hrefEditRedirect = `${hrefEdit}?redirect=${encodeURIComponent(
            `${window.location.pathname}${window.location.search}`
          )}`
          const editButton =
            isWorkspaces && hrefEdit ? (
              <AuthorizationFilter
                filter={{
                  entity: computedDialect2Response,
                  login: computeLogin,
                  role: ['Record', 'Approve', 'Everything'],
                }}
                hideFromSections
                routeParams={routeParams}
              >
                <FVButton
                  type="button"
                  variant="flat"
                  size="small"
                  component="a"
                  className="DictionaryList__linkEdit PrintHide"
                  href={hrefEditRedirect}
                  onClick={(e) => {
                    e.preventDefault()
                    NavigationHelpers.navigate(hrefEditRedirect, this.props.pushWindowPath, false)
                  }}
                >
                  <Edit title={intl.trans('edit', 'Edit', 'first')} />
                </FVButton>
              </AuthorizationFilter>
            ) : null
          return (
            <>
              <Link className="DictionaryList__link DictionaryList__link--indigenous" href={href}>
                {v}
              </Link>
              {editButton}
            </>
          )
        },
        sortName: 'fv:custom_order',
        sortBy: 'fv:custom_order',
      },
      {
        name: 'fv:definitions',
        title: intl.trans('definitions', 'Definitions', 'first'),
        columnDataTemplate: dictionaryListSmallScreenColumnDataTemplate.custom,
        columnDataTemplateCustom: dictionaryListSmallScreenColumnDataTemplateCustomInspectChildrenCellRender,
        render: (v, data, cellProps) => {
          return UIHelpers.generateOrderedListFromDataset({
            dataSet: selectn(`properties.${cellProps.name}`, data),
            extractDatum: (entry, i) => {
              if (entry.language === DEFAULT_LANGUAGE && i < 2) {
                return entry.translation
              }
              return null
            },
            classNameList: 'DictionaryList__definitionList',
            classNameListItem: 'DictionaryList__definitionListItem',
          })
        },
        sortName: 'fv:definitions/0/translation',
      },
      {
        name: 'related_audio',
        title: intl.trans('audio', 'Audio', 'first'),
        columnDataTemplate: dictionaryListSmallScreenColumnDataTemplate.custom,
        columnDataTemplateCustom: dictionaryListSmallScreenColumnDataTemplateCustomAudio,
        render: (v, data, cellProps) => {
          const firstAudio = selectn('contextParameters.word.' + cellProps.name + '[0]', data)
          if (firstAudio) {
            return (
              <Preview
                key={selectn('uid', firstAudio)}
                minimal
                tagProps={{ preload: 'none' }}
                styles={{ padding: 0 }}
                tagStyles={{ width: '100%', minWidth: '230px' }}
                expandedValue={firstAudio}
                type="FVAudio"
              />
            )
          }
        },
      },
      {
        name: 'related_pictures',
        width: 72,
        textAlign: 'center',
        title: intl.trans('picture', 'Picture', 'first'),
        columnDataTemplate: dictionaryListSmallScreenColumnDataTemplate.cellRender,
        render: (v, data, cellProps) => {
          const firstPicture = selectn('contextParameters.word.' + cellProps.name + '[0]', data)
          if (firstPicture) {
            return (
              <img
                className="PrintHide itemThumbnail"
                key={selectn('uid', firstPicture)}
                src={UIHelpers.getThumbnail(firstPicture, 'Thumbnail')}
                alt=""
              />
            )
          }
        },
      },
      {
        name: 'fv-word:part_of_speech',
        title: intl.trans('part_of_speech', 'Part of Speech', 'first'),
        columnDataTemplate: dictionaryListSmallScreenColumnDataTemplate.cellRender,
        render: (v, data) => selectn('contextParameters.word.part_of_speech', data),
        sortBy: 'fv-word:part_of_speech',
      },
    ]

    // NOTE: Append `categories` & `state` columns if on Workspaces
    if (routeParams.area === WORKSPACES) {
      columns.push({
        name: 'fv-word:categories',
        title: intl.trans('categories', 'Categories', 'first'),
        render: (v, data) => {
          return UIHelpers.generateDelimitedDatumFromDataset({
            dataSet: selectn('contextParameters.word.categories', data),
            extractDatum: (entry) => selectn('dc:title', entry),
          })
        },
      })

      columns.push({
        name: 'state',
        title: intl.trans('state', 'State', 'first'),
      })
    }

    return columns
  }

  listViewResetSearch = () => {
    let newFilter = this.state.filterInfo
    newFilter = newFilter.set('currentAppliedFilter', new Map())
    newFilter = newFilter.set('currentAppliedFiltersDesc', new Map())
    newFilter = newFilter.set('currentCategoryFilterIds', new Set())

    this.setState(
      {
        filterInfo: newFilter,
      },
      () => {
        updateUrlAfterResetSearch({
          routeParams: this.props.routeParams,
          splitWindowPath: this.props.splitWindowPath,
          pushWindowPath: this.props.pushWindowPath,
        })
      }
    )
  }

  listViewHandleSearch = () => {
    this.changeFilter()
  }
  listViewFetcher = ({ currentPageIndex, pageSize }) => {
    const newUrl = appendPathArrayAfterLandmark({
      pathArray: [pageSize, currentPageIndex],
      splitWindowPath: this.props.splitWindowPath,
      landmarkArray: [this.props.routeParams.category],
    })
    NavigationHelpers.navigate(`/${newUrl}`, this.props.pushWindowPath)
  }
  listViewSortHandler = ({ page, pageSize, sortBy, sortOrder } = {}) => {
    sortHandler({
      page,
      pageSize,
      sortBy,
      sortOrder,
      setRouteParams: this.props.setRouteParams,
      routeParams: this.props.routeParams,
      splitWindowPath: this.props.splitWindowPath,
      pushWindowPath: this.props.pushWindowPath,
    })
  }
  // =============================================
  // ALPHABET
  // =============================================
  handleAlphabetClick = async (letter, href) => {
    await this.props.searchDialectUpdate({
      searchByAlphabet: letter,
      searchByMode: SEARCH_BY_ALPHABET,
      searchBySettings: {
        searchByTitle: true,
        searchByDefinitions: false,
        searchByTranslations: false,
        searchPartOfSpeech: SEARCH_PART_OF_SPEECH_ANY,
      },
      searchTerm: '',
    })

    this.changeFilter()

    NavigationHelpers.navigate(href, this.props.pushWindowPath)
  }

  changeFilter = () => {
    const { filterInfo } = this.state
    const { computeSearchDialect, routeParams, splitWindowPath } = this.props
    const { searchByMode, searchNxqlQuery } = computeSearchDialect

    const newFilter = updateFilter({
      filterInfo,
      searchByMode,
      searchNxqlQuery,
    })

    // When facets change, pagination should be reset.
    // In these pages (words/phrase), list views are controlled via URL
    if (is(filterInfo, newFilter) === false) {
      this.setState({ filterInfo: newFilter }, () => {
        // NOTE: `updateUrlIfPageOrPageSizeIsDifferent` below can trigger FW-256:
        // "Back button is not working properly when paginating within alphabet chars
        // (Navigate to /learn/words/alphabet/a/1/1 - go to page 2, 3, 4. Use back button.
        // You will be sent to the first page)"
        //
        // The above test (`is(...) === false`) prevents updates triggered by back or forward buttons
        // and any other unnecessary updates (ie: the filter didn't change)
        updateUrlIfPageOrPageSizeIsDifferent({
          // pageSize, // TODO ?
          preserveSearch: true,
          pushWindowPath: this.props.pushWindowPath,
          routeParams,
          splitWindowPath,
        })
      })
    }
  }
}

// PROPTYPES
// -------------------------------------------
const { any, array, bool, func, object, string } = PropTypes
WordsData.propTypes = {
  children: func,
  hasPagination: bool,
  DEFAULT_LANGUAGE: any, // TODO ?
  // REDUX: reducers/state
  computeCategories: object.isRequired,
  computeCharacters: object.isRequired,
  computeDialect2: object.isRequired,
  computeDocument: object.isRequired,
  computeLogin: object.isRequired,
  computePortal: object.isRequired,
  computeSearchDialect: object.isRequired,
  computeWords: object.isRequired,
  listView: object.isRequired,
  navigationRouteSearch: object.isRequired,
  properties: object.isRequired,
  routeParams: object.isRequired,
  splitWindowPath: array.isRequired,
  windowPath: string.isRequired,
  // REDUX: actions/dispatch/func
  fetchCategories: func.isRequired,
  fetchCharacters: func.isRequired,
  fetchDocument: func.isRequired,
  fetchPortal: func.isRequired,
  fetchWords: func.isRequired,
  pushWindowPath: func.isRequired,
  searchDialectUpdate: func.isRequired,
  setListViewMode: func.isRequired,
  setRouteParams: func.isRequired,
  updatePageProperties: func.isRequired,
}
WordsData.defaultProps = {
  DEFAULT_LANGUAGE: 'english',
}

// REDUX: reducers/state
// -------------------------------------------
const mapStateToProps = (state /*, ownProps*/) => {
  const {
    document,
    fvCharacter,
    fvCategory,
    fvDialect,
    fvPortal,
    fvWord,
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
  const { computePortal } = fvPortal
  const { computeSearchDialect } = searchDialect
  const { computeWords } = fvWord
  const { properties, route } = navigation
  const { splitWindowPath, _windowPath } = windowPath
  return {
    computeCategories,
    computeCharacters,
    computeDialect2,
    computeDocument,
    computeLogin,
    computePortal,
    computeSearchDialect,
    computeWords,
    listView,
    properties,
    navigationRouteSearch: route.search,
    routeParams: route.routeParams,
    splitWindowPath,
    windowPath: _windowPath,
  }
}

// REDUX: actions/dispatch/func
const mapDispatchToProps = {
  fetchCategories,
  fetchCharacters,
  fetchDocument,
  fetchPortal,
  fetchWords,
  pushWindowPath,
  searchDialectUpdate,
  setListViewMode,
  setRouteParams,
  updatePageProperties,
}

export default connect(mapStateToProps, mapDispatchToProps)(WordsData)
