import PropTypes from 'prop-types'

import React, { useEffect, useState } from 'react'
import Edit from '@material-ui/icons/Edit'
import selectn from 'selectn'
import Immutable from 'immutable'

// FPCC

import useDialect from 'dataSources/useDialect'
import useDocument from 'dataSources/useDocument'
import useIntl from 'dataSources/useIntl'
import useListView from 'dataSources/useListView'
import useLogin from 'dataSources/useLogin'
import useRoute from 'dataSources/useRoute'
import usePhrase from 'dataSources/usePhrase'
import usePortal from 'dataSources/usePortal'
import useSearchDialect from 'dataSources/useSearchDialect'
import useWindowPath from 'dataSources/useWindowPath'

// Helpers
import { getDialectClassname } from 'common/Helpers'
import NavigationHelpers, {
  appendPathArrayAfterLandmark,
  getSearchObject,
  hasPagination,
  updateUrlIfPageOrPageSizeIsDifferent,
} from 'common/NavigationHelpers'
import ProviderHelpers from 'common/ProviderHelpers'
import UIHelpers from 'common/UIHelpers'
import { WORKSPACES, SEARCH_DATA_TYPE_PHRASE } from 'common/Constants'

// Components
import AuthorizationFilter from 'components/AuthorizationFilter'
import FVButton from 'components/FVButton'
import Link from 'components/Link'
import Preview from 'components/Preview'
import {
  dictionaryListSmallScreenColumnDataTemplate,
  dictionaryListSmallScreenColumnDataTemplateCustomAudio,
  dictionaryListSmallScreenColumnDataTemplateCustomInspectChildrenCellRender,
  dictionaryListSmallScreenColumnDataTemplateCustomState,
} from 'components/DictionaryList/DictionaryListSmallScreen'

/**
 * @summary PhrasesListData
 * @version 1.0.1
 * @component
 *
 * @param {object} props
 * @param {function} props.children
 *
 */

function PhrasesListData({ children }) {
  const { computeDocument, fetchDocument } = useDocument()
  const { computeDialect2, fetchDialect2 } = useDialect()
  const { intl } = useIntl()
  const { listView, setListViewMode } = useListView()
  const { computeLogin } = useLogin()
  const { routeParams, setRouteParams, navigationRouteSearch } = useRoute()
  const { computePortal, fetchPortal } = usePortal()
  const { computeSearchDialect } = useSearchDialect()
  const { pushWindowPath, splitWindowPath } = useWindowPath()
  const { computePhrases, fetchPhrases } = usePhrase()

  const { searchNxqlQuery = '' } = computeSearchDialect

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (curFetchDocumentAction === 'FV_DOCUMENT_FETCH_SUCCESS') {
      fetchListViewData({ pageIndex: routeParams.page, pageSize: routeParams.pageSize })
    }
  }, [
    curFetchDocumentAction,
    routeParams.area,
    routeParams.category,
    routeParams.letter,
    routeParams.page,
    routeParams.pageSize,
    navigationRouteSearch,
  ])

  const dictionaryKey = `${routeParams.dialect_path}/Dictionary`
  const DEFAULT_LANGUAGE = 'english'
  const { searchNxqlSort = {} } = computeSearchDialect
  const { DEFAULT_SORT_COL, DEFAULT_SORT_TYPE } = searchNxqlSort

  const [columns] = useState(getColumns())

  // Parsing computeDocument
  const extractComputeDocument = ProviderHelpers.getEntry(computeDocument, dictionaryKey)
  const dialectUid = selectn('response.contextParameters.ancestry.dialect.uid', extractComputeDocument)
  const curFetchDocumentAction = selectn('action', extractComputeDocument)
  const dictionary = selectn('response', extractComputeDocument)
  const dictionaryId = selectn('uid', dictionary)

  // Parsing computePortal
  const extractComputePortal = ProviderHelpers.getEntry(computePortal, `${routeParams.dialect_path}/Portal`)
  const dialectClassName = getDialectClassname(extractComputePortal)
  const pageTitle = `${selectn('response.contextParameters.ancestry.dialect.dc:title', extractComputePortal) ||
    ''} ${intl.trans('phrases', 'Phrases', 'first')}`

  // Parsing computeDialect2
  const computedDialect2 = ProviderHelpers.getEntry(computeDialect2, routeParams.dialect_path)
  const dialect = selectn('response', computedDialect2)

  // Parsing computePhrases
  const computedEntries = ProviderHelpers.getEntry(computePhrases, dictionaryKey)
  const items = selectn('response.entries', computedEntries)
  const metadata = selectn('response', computedEntries)

  const computeEntities = Immutable.fromJS([
    {
      id: dictionaryKey,
      entity: computePhrases,
    },
  ])

  const fetchData = async () => {
    // Dialect
    await ProviderHelpers.fetchIfMissing(routeParams.dialect_path, fetchDialect2, computeDialect2)
    // Document
    await ProviderHelpers.fetchIfMissing(dictionaryKey, fetchDocument, computeDocument)
    // Portal
    await ProviderHelpers.fetchIfMissing(`${routeParams.dialect_path}/Portal`, fetchPortal, computePortal)
    // Phrases
    fetchListViewData()
  }

  async function fetchListViewData({ pageIndex = 1, pageSize = 10, resetSearch = false } = {}) {
    let currentAppliedFilter = ''

    if (searchNxqlQuery && !resetSearch) {
      currentAppliedFilter = ` AND ${searchNxqlQuery}`
    }

    // Handle phrasebooks
    if (routeParams.phraseBook && !resetSearch) {
      // Private
      if (routeParams.area === 'Workspaces') {
        currentAppliedFilter = ` AND fv-phrase:phrase_books/* IN ("${routeParams.phraseBook}")`
      }
      // Public
      if (routeParams.area === 'sections') {
        currentAppliedFilter = ` AND fvproxy:proxied_categories/* IN ("${routeParams.phraseBook}")`
      }
    }
    // WORKAROUND: DY @ 17-04-2019 - Mark this query as a "starts with" query. See DirectoryOperations.js for note
    const startsWithQuery = ProviderHelpers.isStartsWithQuery(currentAppliedFilter)
    const searchObj = getSearchObject()
    // 1st: redux values, 2nd: url search query, 3rd: defaults
    const sortOrder = navigationRouteSearch.sortOrder || searchObj.sortOrder || DEFAULT_SORT_TYPE
    const sortBy = navigationRouteSearch.sortBy || searchObj.sortBy || DEFAULT_SORT_COL

    const nql = `${currentAppliedFilter}&currentPageIndex=${pageIndex -
      1}&dialectId=${dialectUid}&pageSize=${pageSize}&sortOrder=${sortOrder}&sortBy=${sortBy}${
      routeParams.letter ? `&letter=${routeParams.letter}&starts_with_query=Document.CustomOrderQuery` : startsWithQuery
    }`

    fetchPhrases(dictionaryKey, nql)
  }

  const onNavigateRequest = (path) => {
    if (hasPagination) {
      NavigationHelpers.navigateForward(splitWindowPath.slice(0, splitWindowPath.length - 2), [path], pushWindowPath)
    } else {
      NavigationHelpers.navigateForward(splitWindowPath, [path], pushWindowPath)
    }
  }

  const handleCreateClick = () => {
    const url = appendPathArrayAfterLandmark({
      pathArray: ['create'],
      splitWindowPath: splitWindowPath,
    })
    if (url) {
      NavigationHelpers.navigate(`/${url}`, pushWindowPath, false)
    } else {
      onNavigateRequest({
        hasPagination,
        path: 'create',
        pushWindowPath,
        splitWindowPath,
      })
    }
  }

  // Filter for AuthorizationFilter
  const filter = {
    entity: dictionary,
    login: computeLogin,
    role: ['Record', 'Approve', 'Everything'],
  }

  function getColumns() {
    const columnsArray = [
      {
        name: 'title',
        title: intl.trans('phrase', 'Phrase', 'first'),
        columnDataTemplate: dictionaryListSmallScreenColumnDataTemplate.cellRender,
        render: (v, data) => {
          const isWorkspaces = routeParams.area === WORKSPACES
          const href = NavigationHelpers.generateUIDPath(routeParams.siteTheme, data, 'phrases')
          const hrefEdit = NavigationHelpers.generateUIDEditPath(routeParams.siteTheme, data, 'phrases')
          const hrefEditRedirect = `${hrefEdit}?redirect=${encodeURIComponent(
            `${window.location.pathname}${window.location.search}`
          )}`
          const editButton =
            isWorkspaces && hrefEdit ? (
              <AuthorizationFilter
                filter={{
                  entity: dialect,
                  login: computeLogin,
                  role: ['Record', 'Approve', 'Everything'],
                }}
                hideFromSections
                routeParams={routeParams}
              >
                <FVButton
                  type="button"
                  disableElevation
                  size="small"
                  component="a"
                  className="PhrasesList__linkEdit PrintHide"
                  href={hrefEditRedirect}
                  onClick={(e) => {
                    e.preventDefault()
                    NavigationHelpers.navigate(hrefEditRedirect, pushWindowPath, false)
                  }}
                >
                  <Edit title={intl.trans('edit', 'Edit', 'first')} />
                </FVButton>
              </AuthorizationFilter>
            ) : null
          return (
            <>
              <Link className="PhrasesList__link PhrasesList__link--indigenous" href={href}>
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
            classNameList: 'PhrasesList__definitionList',
            classNameListItem: 'PhrasesList__definitionListItem',
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
          const firstAudio = selectn('contextParameters.phrase.' + cellProps.name + '[0]', data)
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
          const firstPicture = selectn('contextParameters.phrase.' + cellProps.name + '[0]', data)
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
    ]
    // NOTE: Append `categories` & `state` columns if on Workspaces
    if (routeParams.area === WORKSPACES) {
      columnsArray.push({
        name: 'fv-phrase:phrase_books',
        title: intl.trans('phrase books', 'Phrase books', 'first'),
        render: (v, data) => {
          return UIHelpers.generateDelimitedDatumFromDataset({
            dataSet: selectn('contextParameters.phrase.phrase_books', data),
            extractDatum: (entry) => selectn('dc:title', entry),
          })
        },
      })
      columnsArray.push({
        name: 'state',
        title: 'Visibility',
        columnDataTemplate: dictionaryListSmallScreenColumnDataTemplate.custom,
        columnDataTemplateCustom: dictionaryListSmallScreenColumnDataTemplateCustomState,
      })
    }
    return columnsArray
  }

  function fetcher({ currentPageIndex, pageSize }) {
    let newUrl = ''
    if (routeParams.letter) {
      newUrl = appendPathArrayAfterLandmark({
        pathArray: [pageSize, currentPageIndex],
        splitWindowPath: splitWindowPath,
        landmarkArray: [routeParams.letter],
      })
    } else if (routeParams.category) {
      newUrl = appendPathArrayAfterLandmark({
        pathArray: [pageSize, currentPageIndex],
        splitWindowPath: splitWindowPath,
        landmarkArray: [routeParams.category],
      })
    } else {
      newUrl = appendPathArrayAfterLandmark({
        pathArray: [pageSize, currentPageIndex],
        splitWindowPath: splitWindowPath,
        landmarkArray: ['phrases'],
      })
    }
    if (newUrl) {
      NavigationHelpers.navigate(`/${newUrl}`, pushWindowPath)
    }
  }

  const sortHandler = async ({ page, pageSize, sortBy, sortOrder } = {}) => {
    await setRouteParams({
      search: {
        pageSize,
        page,
        sortBy,
        sortOrder,
      },
    })
    // Conditionally update the url after a sort event
    updateUrlIfPageOrPageSizeIsDifferent({
      page,
      pageSize,
      pushWindowPath: pushWindowPath,
      routeParamsPage: routeParams.page,
      routeParamsPageSize: routeParams.pageSize,
      splitWindowPath: splitWindowPath,
      windowLocationSearch: window.location.search, // Set only if you want to append the search
    })
  }

  const _resetSearch = () => {
    // Remove alphabet/category filter urls
    if (routeParams.category || routeParams.letter) {
      let resetUrl = `/${splitWindowPath.join('/')}`
      const _splitWindowPath = [...splitWindowPath]
      const learnIndex = _splitWindowPath.indexOf('learn')
      if (learnIndex !== -1) {
        _splitWindowPath.splice(learnIndex + 2)
        resetUrl = `/${_splitWindowPath.join('/')}`
      }
      NavigationHelpers.navigate(`${resetUrl}/${routeParams.pageSize}/1`, pushWindowPath, false)
    } else {
      // When facets change, pagination should be reset.
      // In these pages (words/phrase), list views are controlled via URL
      fetchListViewData({ pageIndex: routeParams.page, pageSize: routeParams.pageSize, resetSearch: true })
      resetURLPagination()
    }
  }

  const resetURLPagination = ({ pageSize = null, preserveSearch = false } = {}) => {
    const urlPage = 1
    const urlPageSize = pageSize || routeParams.pageSize || 10

    const navHelperCallback = (url) => {
      pushWindowPath(`${url}${preserveSearch ? window.location.search : ''}`)
    }
    const hasPaginationUrl = hasPagination(splitWindowPath)
    if (hasPaginationUrl) {
      // Replace them
      NavigationHelpers.navigateForwardReplaceMultiple(splitWindowPath, [urlPageSize, urlPage], navHelperCallback)
    } else {
      // No pagination in url (eg: .../learn/phrases), append `urlPage` & `urlPageSize`
      NavigationHelpers.navigateForward(splitWindowPath, [urlPageSize, urlPage], navHelperCallback)
    }
  }

  const handleSearch = async ({ href, updateUrl = true } = {}) => {
    if (href && updateUrl) {
      NavigationHelpers.navigate(href, pushWindowPath, false)
    } else {
      resetURLPagination({ preserveSearch: true })
    }

    fetchListViewData({ pageIndex: routeParams.page, pageSize: routeParams.pageSize })
  }

  const phrasesSearchUi = [
    {
      defaultChecked: true,
      idName: 'searchByTitle',
      labelText: 'Phrase',
    },
    {
      defaultChecked: true,
      idName: 'searchByDefinitions',
      labelText: 'Definitions',
    },
    {
      idName: 'searchByCulturalNotes',
      labelText: 'Cultural notes',
    },
  ]

  return children({
    columns,
    computeEntities,
    dialect,
    dialectClassName,
    dialectUid,
    fetcher,
    fetcherParams: {
      currentPageIndex: Number(routeParams.page),
      pageSize: Number(routeParams.pageSize),
    },
    filter,
    handleCreateClick,
    handleSearch,
    isKidsTheme: routeParams.siteTheme === 'kids',
    items,
    listViewMode: listView.mode,
    metadata,
    navigationRouteSearch,
    pageTitle,
    dictionaryId,
    pushWindowPath,
    routeParams,
    resetSearch: _resetSearch,
    searchDialectDataType: SEARCH_DATA_TYPE_PHRASE,
    searchUi: phrasesSearchUi,
    setRouteParams,
    setListViewMode,
    sortCol: DEFAULT_SORT_COL,
    sortHandler,
    sortType: DEFAULT_SORT_TYPE,
  })
}

// PROPTYPES
const { func } = PropTypes
PhrasesListData.propTypes = {
  children: func,
}

export default PhrasesListData
