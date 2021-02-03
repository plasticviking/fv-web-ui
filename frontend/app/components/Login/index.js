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

// REDUX
import { connect } from 'react-redux'
// REDUX: actions/dispatch/func
import { pushWindowPath } from 'reducers/windowPath'

import selectn from 'selectn'
import { isMobile } from 'react-device-detect'

import FVLabel from 'components/FVLabel'

const { func, object, string } = PropTypes

export class Login extends Component {
  static propTypes = {
    className: string,
    routeParams: object,
    // REDUX: reducers/state
    computeLogin: object.isRequired,
    properties: object.isRequired,
    // REDUX: actions/dispatch/func
    pushWindowPath: func.isRequired,
  }

  constructor(props, context) {
    super(props, context)

    this.state = {
      open: false,
      loginAttempted: false,
      loginAttemptCleared: false,
    }

    this.anchorEl = null
    ;['_handleOpen', '_handleClose', '_onNavigateRequest'].forEach((method) => (this[method] = this[method].bind(this)))
  }

  _handleOpen(event) {
    event.preventDefault()

    if (isMobile) {
      this._onNavigateRequest('login')
      return
    }

    this.setState({
      open: true,
    })
  }

  _handleClose() {
    this.setState({
      open: false,
    })
  }

  _onNavigateRequest(path) {
    let dest = '/' + path + '/'

    if (selectn('routeParams.dialect_path', this.props) && path === 'register') {
      dest = '/explore' + this.props.routeParams.dialect_path + '/' + path
    }

    this._handleClose()
    this.props.pushWindowPath(dest)
  }

  render() {
    const { className } = this.props

    // Handle success (anonymous or actual)
    if (this.props.computeLogin.success && this.props.computeLogin.isConnected) {
      return (
        <span className={`Login Login--welcome hidden-xs ${className}`}>
          <FVLabel transKey="general.welcome" defaultStr="WELCOME" transform="upper" />,{' '}
          {selectn('response.properties.firstName', this.props.computeLogin)}
          <a href={'/dashboard'} className={'Navigation__link'}>
            Dashboard
          </a>
        </span>
      )
    }
    return (
      <span className={'Login Login--welcome hidden-xs'}>
        <FVLabel transKey="general.welcome" defaultStr="WELCOME" transform="upper" />, Guest
        <a className={'Navigation__link'} href="/nuxeo/logout?requestedUrl=login.jsp">
          SIGN IN
        </a>
      </span>
    )
  }
}

// REDUX: reducers/state
const mapStateToProps = (state /*, ownProps*/) => {
  const { navigation, nuxeo } = state

  const { properties } = navigation
  const { computeLogin } = nuxeo

  return {
    computeLogin,
    properties,
  }
}

// REDUX: actions/dispatch/func
const mapDispatchToProps = {
  pushWindowPath,
}

export default connect(mapStateToProps, mapDispatchToProps)(Login)
