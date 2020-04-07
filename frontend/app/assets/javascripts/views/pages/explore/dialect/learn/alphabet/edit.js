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
import Immutable from 'immutable'

// REDUX
import { connect } from 'react-redux'
// REDUX: actions/dispatch/func
import { fetchCharacter, updateCharacter } from 'providers/redux/reducers/fvCharacter'
import { pushWindowPath, replaceWindowPath } from 'providers/redux/reducers/windowPath'
import { fetchDialect2 } from 'providers/redux/reducers/fvDialect'

import selectn from 'selectn'
import AuthenticationFilter from 'views/components/Document/AuthenticationFilter'
import ProviderHelpers from 'common/ProviderHelpers'
import NavigationHelpers from 'common/NavigationHelpers'
import PromiseWrapper from 'views/components/Document/PromiseWrapper'
import StateErrorBoundary from 'views/components/ErrorBoundary'
import FVLabel from 'views/components/FVLabel/index'

// Models
import { Document } from 'nuxeo'

// Views
import fields from 'models/schemas/fields'
import options from 'models/schemas/options'

import withForm from 'views/hoc/view/with-form'

const EditViewWithForm = withForm(PromiseWrapper, true)

const { array, func, object } = PropTypes
export class PageDialectAlphabetCharacterEdit extends Component {
  static propTypes = {
    character: object,
    routeParams: object.isRequired,
    // REDUX: reducers/state
    computeCharacter: object.isRequired,
    computeDialect2: object.isRequired,
    fetchDialect2: func.isRequired,
    splitWindowPath: array.isRequired,
    // REDUX: actions/dispatch/func
    fetchCharacter: func.isRequired,
    pushWindowPath: func.isRequired,
    replaceWindowPath: func.isRequired,
    updateCharacter: func.isRequired,
  }

  constructor(props, context) {
    super(props, context)

    this.state = {
      character: null,
      characterPath: props.routeParams.dialect_path + '/Alphabet/' + props.routeParams.character,
      formValue: null,
      is403: false,
    }
  }

  // Fetch data on initial render
  componentDidMount() {
    this.fetchData()
  }

  // Refetch data on URL change
  componentDidUpdate(prevProps) {
    let previousCharacter
    let currentCharacter

    if (this.state.characterPath !== null) {
      previousCharacter = ProviderHelpers.getEntry(prevProps.computeCharacter, this.state.characterPath)
      currentCharacter = ProviderHelpers.getEntry(this.props.computeCharacter, this.state.characterPath)
    }

    // 'Redirect' on success
    if (
      selectn('wasUpdated', previousCharacter) != selectn('wasUpdated', currentCharacter) &&
      selectn('wasUpdated', currentCharacter) === true
    ) {
      this._navigateUp()
    }
  }

  render() {
    let context

    const computeEntities = Immutable.fromJS([
      {
        id: this.state.characterPath,
        entity: this.props.computeCharacter,
      },
      {
        id: this.props.routeParams.dialect_path,
        entity: this.props.computeDialect2,
      },
    ])

    const computeCharacter = ProviderHelpers.getEntry(this.props.computeCharacter, this.state.characterPath)
    const computeDialect2 = ProviderHelpers.getEntry(this.props.computeDialect2, this.props.routeParams.dialect_path)

    // Additional context (in order to store origin)
    if (selectn('response', computeDialect2)) {
      context = Object.assign(selectn('response', computeDialect2), {
        otherContext: { parentId: selectn('response.uid', computeCharacter) },
      })
    }

    return (
      <AuthenticationFilter
        is403={this.state.is403}
        login={this.props.computeLogin}
        anon={false}
        routeParams={this.props.routeParams}
        notAuthenticatedComponent={
          <StateErrorBoundary /*copy={this.state.copy} errorMessage={this.state.errorMessage}*/ />
        }
      >
        <div>
          <h1>
            <FVLabel
              transKey="views.pages.explore.dialect.learn.alphabet.edit_x_character"
              defaultStr={'Edit ' + selectn('response.properties.dc:title', computeCharacter) + ' character'}
              transform="first"
              params={[selectn('response.properties.dc:title', computeCharacter)]}
            />
          </h1>

          <EditViewWithForm
            computeEntities={computeEntities}
            initialValues={context}
            itemId={this.state.characterPath}
            fields={fields}
            options={options}
            saveMethod={this._handleSave}
            cancelMethod={this._navigateUp}
            currentPath={this.props.splitWindowPath}
            navigationMethod={this.props.replaceWindowPath}
            type="FVCharacter"
            routeParams={this.props.routeParams}
          />
        </div>
      </AuthenticationFilter>
    )
  }

  fetchData = async() => {
    await this.props.fetchDialect2(this.props.routeParams.dialect_path)
    const _computeDialect2 = ProviderHelpers.getEntry(this.props.computeDialect2, this.props.routeParams.dialect_path)
    if (_computeDialect2.isError) {
      this.setState({
        // Note: Intentional == comparison
        is403: _computeDialect2.message == '403',
        errorMessage: _computeDialect2.message,
      })
      return
    }
    this.props.fetchCharacter(this.state.characterPath)
  }

  _handleSave = (character, formValue) => {
    const newDocument = new Document(character.response, {
      repository: character.response._repository,
      nuxeo: character.response._nuxeo,
    })

    // Set new value property on document
    newDocument.set(formValue)

    // Save document
    this.props.updateCharacter(newDocument)

    this.setState({ formValue: formValue })
  }

  _navigateUp = () => {
    NavigationHelpers.navigateUp(this.props.splitWindowPath, this.props.replaceWindowPath)
  }
}

// REDUX: reducers/state
const mapStateToProps = (state /*, ownProps*/) => {
  const { fvCharacter, fvDialect, nuxeo, windowPath } = state

  const { computeCharacter } = fvCharacter
  const { computeDialect2 } = fvDialect
  const { splitWindowPath, _windowPath } = windowPath
  const { computeLogin } = nuxeo
  return {
    computeCharacter,
    computeDialect2,
    computeLogin,
    splitWindowPath,
    windowPath: _windowPath,
  }
}

// REDUX: actions/dispatch/func
const mapDispatchToProps = {
  fetchCharacter,
  fetchDialect2,
  pushWindowPath,
  replaceWindowPath,
  updateCharacter,
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PageDialectAlphabetCharacterEdit)
