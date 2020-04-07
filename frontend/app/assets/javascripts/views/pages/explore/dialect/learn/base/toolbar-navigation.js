/*
Copyright 2016 First People's Cultural Council

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
import React, { Component } from 'react'
import PropTypes from 'prop-types'

import classNames from 'classnames'

// REDUX
import { connect } from 'react-redux'
// REDUX: actions/dispatch/func
import { fetchResultSet } from 'providers/redux/reducers/document'
import { navigateTo } from 'providers/redux/reducers/navigation'
import { pushWindowPath } from 'providers/redux/reducers/windowPath'

// import selectn from 'selectn'
// import ProviderHelpers from 'common/ProviderHelpers'
import NavigationHelpers from 'common/NavigationHelpers'

import EditorInsertChart from '@material-ui/icons/InsertChart'
import FVButton from 'views/components/FVButton'
import AuthenticationFilter from 'views/components/Document/AuthenticationFilter'
import FVLabel from 'views/components/FVLabel/index'

/**
 * Navigation for learning page
 */

const { array, bool, func, object, string } = PropTypes
export class ToolbarNavigation extends Component {
  static propTypes = {
    routeParams: object.isRequired,
    handleShowStats: func,
    hideStatistics: bool,
    isStatisticsVisible: bool,
    // REDUX: reducers/state
    computeLogin: object.isRequired,
    computeResultSet: object.isRequired,
    splitWindowPath: array.isRequired,
    windowPath: string.isRequired,
    // REDUX: actions/dispatch/func
    fetchResultSet: func.isRequired,
    navigateTo: func.isRequired,
    pushWindowPath: func.isRequired,
  }

  constructor(props, context) {
    super(props, context)
  }

  componentDidMount() {
    // Get count for language assets
    // this.props.fetchResultSet('count_stories', {
    //     'query': 'SELECT COUNT(ecm:uuid) FROM FVBook WHERE fvbook:type="story" AND ecm:path STARTSWITH "' + this.props.routeParams.dialect_path + '/Stories & Songs" AND ecm:currentLifeCycleState <> "deleted"',
    //     'language': 'nxql',
    //     'sortOrder': 'ASC'
    // });
    // this.props.fetchResultSet('count_songs', {
    //     'query': 'SELECT COUNT(ecm:uuid) FROM FVBook WHERE fvbook:type="song" AND ecm:path STARTSWITH "' + this.props.routeParams.dialect_path + '/Stories & Songs" AND ecm:isTrashed = 0',
    //     'language': 'nxql',
    //     'sortOrder': 'ASC'
    // });
    // this.props.fetchResultSet('count_words', {
    //     'query': 'SELECT COUNT(ecm:uuid) FROM FVWord WHERE ecm:path STARTSWITH "' + this.props.routeParams.dialect_path + '/Dictionary" AND ecm:isTrashed = 0',
    //     'language': 'nxql',
    //     'sortOrder': 'ASC'
    // });
    // this.props.fetchResultSet('count_phrases', {'query': 'SELECT COUNT(ecm:uuid) FROM FVPhrase WHERE ecm:path STARTSWITH "' + this.props.routeParams.dialect_path + '/Dictionary" AND ecm:isTrashed = 0'});
  }

  _onNavigateRequest = (pathArray, e) => {
    e.preventDefault()
    if (this.props.splitWindowPath[this.props.splitWindowPath.length - 1] === 'learn') {
      NavigationHelpers.navigateForward(this.props.splitWindowPath, pathArray, this.props.pushWindowPath)
    } else {
      NavigationHelpers.navigateForwardReplace(this.props.splitWindowPath, pathArray, this.props.pushWindowPath)
    }
  }

  _getNavigationURL = (path) => {
    if (this.props.splitWindowPath[this.props.splitWindowPath.length - 1] === 'learn') {
      return this.props.windowPath + '/' + path
    }
    return this.props.windowPath + '/learn/' + path
  }

  render() {
    /*
    // TODO: Find out why the results sometimes in field1 and sometimes in field2?
    const COUNT_FIELD1 = 'response.entries[0].COUNT(ecm:uuid)'
    const COUNT_FIELD2 = 'response.entries[1].COUNT(ecm:uuid)'
    const computeSongsCount = ProviderHelpers.getEntry(this.props.computeResultSet, 'count_songs')
    const computeStoriesCount = ProviderHelpers.getEntry(this.props.computeResultSet, 'count_stories')
    const computeWordsCount = ProviderHelpers.getEntry(this.props.computeResultSet, 'count_words')
    const computePhrasesCount = ProviderHelpers.getEntry(this.props.computeResultSet, 'count_phrases')

    const wordCount =
      selectn(COUNT_FIELD1, computeWordsCount) == undefined
        ? '...'
        : selectn(COUNT_FIELD1, computeWordsCount) + selectn(COUNT_FIELD2, computeWordsCount)
    const phraseCount =
      selectn(COUNT_FIELD1, computePhrasesCount) == undefined
        ? '...'
        : selectn(COUNT_FIELD1, computePhrasesCount) + selectn(COUNT_FIELD2, computePhrasesCount)
    const songCount =
      selectn(COUNT_FIELD1, computeSongsCount) == undefined
        ? '...'
        : selectn(COUNT_FIELD1, computeSongsCount) + selectn(COUNT_FIELD2, computeSongsCount)
    const storyCount =
      selectn(COUNT_FIELD1, computeStoriesCount) == undefined
        ? '...'
        : selectn(COUNT_FIELD1, computeStoriesCount) + selectn(COUNT_FIELD2, computeStoriesCount)
    */

    return (
      <div className="dialect-navigation">
        <div className="row">
          <div className="col-xs-12 col-md-10">
            <div float="left">
              <a href={this._getNavigationURL('words')} onClick={this._onNavigateRequest.bind(this, 'words')}>
                <FVLabel transKey="words" defaultStr="Words" transform="first" />
              </a>
              <a href={this._getNavigationURL('phrases')} onClick={this._onNavigateRequest.bind(this, 'phrases')}>
                <FVLabel transKey="phrases" defaultStr="Phrases" transform="first" />
              </a>
              <a href={this._getNavigationURL('songs')} onClick={this._onNavigateRequest.bind(this, 'songs')}>
                <FVLabel transKey="songs" defaultStr="Songs" transform="first" />
              </a>
              <a href={this._getNavigationURL('stories')} onClick={this._onNavigateRequest.bind(this, 'stories')}>
                <FVLabel transKey="stories" defaultStr="Stories" transform="first" />
              </a>
              <a href={this._getNavigationURL('alphabet')} onClick={this._onNavigateRequest.bind(this, 'alphabet')}>
                <FVLabel transKey="alphabet" defaultStr="Alphabet" transform="first" />
              </a>
            </div>
          </div>
          {this.props.hideStatistics !== true && this.props.isStatisticsVisible !== true && (
            <AuthenticationFilter login={this.props.computeLogin} hideFromSections routeParams={this.props.routeParams}>
              <div className="col-xs-12 col-md-2">
                <div className={classNames('hidden-xs')} float="right">
                  <FVButton variant="flat" style={{ color: '#fff' }} onClick={this.props.handleShowStats}>
                    <EditorInsertChart />
                    <FVLabel transKey="language_statistics" defaultStr="Language Statistics" />
                  </FVButton>
                </div>
              </div>
            </AuthenticationFilter>
          )}
        </div>
      </div>
    )
  }
}

// REDUX: reducers/state
const mapStateToProps = (state /*, ownProps*/) => {
  const { document, nuxeo, windowPath } = state

  const { computeResultSet } = document
  const { computeLogin } = nuxeo
  const { splitWindowPath, _windowPath } = windowPath

  return {
    computeLogin,
    computeResultSet,
    splitWindowPath,
    windowPath: _windowPath,
  }
}

// REDUX: actions/dispatch/func
const mapDispatchToProps = {
  fetchResultSet,
  navigateTo,
  pushWindowPath,
}

export default connect(mapStateToProps, mapDispatchToProps)(ToolbarNavigation)
