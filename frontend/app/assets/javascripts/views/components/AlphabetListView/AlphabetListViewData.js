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
import { Component } from 'react'
import PropTypes from 'prop-types'
import { is } from 'immutable'
// REDUX
import { connect } from 'react-redux'
// REDUX: actions/dispatch/func
import { fetchCharacters } from 'providers/redux/reducers/fvCharacter'

import { pushWindowPath } from 'providers/redux/reducers/windowPath'
import { searchDialectUpdate } from 'providers/redux/reducers/searchDialect'
import { setRouteParams } from 'providers/redux/reducers/navigation'
// -------------------------------------------
import NavigationHelpers, { getSearchObject } from 'common/NavigationHelpers'
import ProviderHelpers from 'common/ProviderHelpers'
import selectn from 'selectn'
import {
  getCharacters,
  updateFilter,
  updateUrlIfPageOrPageSizeIsDifferent,
} from 'views/pages/explore/dialect/learn/base'
import { SEARCH_BY_ALPHABET, SEARCH_PART_OF_SPEECH_ANY } from 'views/components/SearchDialect/constants'

// AlphabetListViewData
// ====================================================
class AlphabetListViewData extends Component {
  constructor(props, context) {
    super(props, context)
  }

  async componentDidMount() {
    const { computeCharacters, routeParams } = this.props
    // Alphabet
    await ProviderHelpers.fetchIfMissing(
      `${routeParams.dialect_path}/Alphabet`,
      this.props.fetchCharacters,
      computeCharacters,
      '&currentPageIndex=0&pageSize=100&sortOrder=asc&sortBy=fvcharacter:alphabet_order'
    )

    await this.reviewUrlParams()
  }

  render() {
    const {
      children,
      computeCharacters,
      // navigationRouteSearch,
      routeParams,
    } = this.props

    const characters = getCharacters({
      computeCharacters,
      routeParamsDialectPath: routeParams.dialect_path,
    })

    return children({
      // Alphabet
      characters,
      letter: selectn('letter', routeParams),
      handleAlphabetClick: this.handleAlphabetClick,
      // Misc
      //   page: this.props.routeParams.page,
      //   pageSize: this.props.routeParams.pageSize,
      //   pushWindowPath: this.props.pushWindowPath,
      //   routeParams: this.props.routeParams,
      //   search: navigationRouteSearch,
      //   setRouteParams: this.props.setRouteParams,
      //   sortBy: selectn('sortBy', navigationRouteSearch),
      //   sortOrder: selectn('sortOrder', navigationRouteSearch),
      //   splitWindowPath: this.props.splitWindowPath,
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
  // NOTE: Ensure window.location.search and redux have the same values
  // ==============================================================================
  reviewUrlParams = async () => {
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
      await this.props.setRouteParams({
        search: {
          pageIndex: this.props.routeParams.page,
          pageSize: this.props.routeParams.pageSize,
          sortBy: windowLocationSearchSortBy,
          sortOrder: windowLocationSearchSortOrder,
        },
      })
    }
  }
}

// PROPTYPES
// -------------------------------------------
const { any, array, bool, func, object } = PropTypes
AlphabetListViewData.propTypes = {
  children: func,
  hasPagination: bool,
  DEFAULT_LANGUAGE: any, // TODO ?
  // REDUX: reducers/state
  computeCharacters: object.isRequired,
  computeSearchDialect: object.isRequired,
  navigationRouteSearch: object.isRequired,
  routeParams: object.isRequired,
  splitWindowPath: array.isRequired,
  // REDUX: actions/dispatch/func
  fetchCharacters: func.isRequired,
  pushWindowPath: func.isRequired,
  searchDialectUpdate: func.isRequired,
  setRouteParams: func.isRequired,
}
AlphabetListViewData.defaultProps = {
  DEFAULT_LANGUAGE: 'english',
}

// REDUX: reducers/state
// -------------------------------------------
const mapStateToProps = (state /*, ownProps*/) => {
  const { fvCharacter, navigation, searchDialect, windowPath } = state

  const { computeCharacters } = fvCharacter
  const { computeSearchDialect } = searchDialect
  const { route } = navigation
  const { splitWindowPath } = windowPath
  return {
    computeCharacters,
    computeSearchDialect,
    navigationRouteSearch: route.search,
    routeParams: route.routeParams,
    splitWindowPath,
  }
}

// REDUX: actions/dispatch/func
const mapDispatchToProps = {
  fetchCharacters,
  pushWindowPath,
  searchDialectUpdate,
  setRouteParams,
}

export default connect(mapStateToProps, mapDispatchToProps)(AlphabetListViewData)
