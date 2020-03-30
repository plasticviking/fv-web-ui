import React, { Component } from 'react'
import { LoginContext, RouteParamsContext } from 'views/AppWrapper'
import AuthenticationFilter from './index'

function AuthenticationFilterHOC() {
  class AFHOC extends Component {
    constructor(props, context) {
      super(props, context)
    }

    render() {
      // return <div>debug</div>
      return (
        <LoginContext.Consumer>
          {(login) => (
            <RouteParamsContext.Consumer>
              {(routeParams) => <AuthenticationFilter login={login} routeParams={routeParams} {...this.props} />}
            </RouteParamsContext.Consumer>
          )}
        </LoginContext.Consumer>
      )
    }
  }
  return AFHOC
}

export default AuthenticationFilterHOC()

// props => (
// <LoginContext.Consumer>
//   {login => (
//     <RouteParamsContext.Consumer>
//       {/* {routeParams => <AuthenticationFilter login={login} routeParams={routeParams} {...props} />} */}
//       {routeParams => <div>auth hoc</div>}
//     </RouteParamsContext.Consumer>
//   )}
// </LoginContext.Consumer>
// )
