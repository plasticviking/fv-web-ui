import React from 'react'
import PropTypes from 'prop-types'
import Button from '@material-ui/core/Button'
import NavigationHelpers from 'common/NavigationHelpers'

// REDUX
import { connect } from 'react-redux'
import { pushWindowPath } from 'providers/redux/reducers/windowPath'

const { bool, string, element, object, func } = PropTypes
const categoryType = {
  title: { plural: 'Categories', singular: 'Category' },
  label: { plural: 'categories', singular: 'category' },
}
export class CategoryStateDetail extends React.Component {
  static propTypes = {
    className: string,
    copy: object,
    breadcrumb: element,
    isTrashed: bool,
    valueName: string,
    valueDescription: string,
    valueParent: string,
    // REDUX: reducers/state
    routeParams: object.isRequired,
    // REDUX: actions/dispatch/func
    pushWindowPath: func.isRequired,
  }
  static defaultProps = {
    className: '',
    breadcrumb: null,
    isTrashed: false,
    valueName: '',
    valueDescription: '',
    valueParent: '',
    copy: {
      default: {},
    },
  }
  render() {
    const { className, copy, isTrashed, valueName, valueDescription, valueParent, breadcrumb, routeParams } = this.props
    const { siteTheme, dialect_path, itemId } = routeParams
    const _copy = copy.detail
    const itemDeleted = isTrashed ? <div className="alert alert-danger">{_copy.isTrashed}</div> : null
    const categoryEditUrl = `/${siteTheme}${dialect_path}/edit/${categoryType.label.singular}/${itemId || ''}`
    return (
      <div className={`${className} Category Category--detail`}>
        <div className="Category__content">
          <div className="Category__main">
            <div className="Category__mainInner">
              {itemDeleted}
              <header>
                {breadcrumb}
                <h1 className="Category__heading">{_copy.title}</h1>
              </header>
              {/* Name ------------- */}
              <h2 className="visually-hidden">{_copy.name}</h2>
              <h2 className="Category__name">{valueName}</h2>

              <p className="visually-hidden">{_copy.parent}</p>
              <p className="Category__parent">{valueParent}</p>

              {/* Description ------------- */}
              <p className="visually-hidden">{_copy.description}</p>
              <div className="Category__description" dangerouslySetInnerHTML={{ __html: valueDescription }} />
            </div>
          </div>
          <div className="Category__btn-container">
            <Button
              className="Category__btn-container"
              variant="contained"
              color="primary"
              href={categoryEditUrl}
              onClick={(e) => {
                e.preventDefault()
                NavigationHelpers.navigate(categoryEditUrl, this.props.pushWindowPath, false)
              }}
            >
              {copy.create.success.editView}
            </Button>
          </div>
        </div>
      </div>
    )
  }
}

// REDUX: reducers/state
const mapStateToProps = (state /*, ownProps*/) => {
  const { navigation } = state

  const { route } = navigation

  return {
    routeParams: route.routeParams,
  }
}

// REDUX: actions/dispatch/func
const mapDispatchToProps = {
  pushWindowPath,
}

export default connect(mapStateToProps, mapDispatchToProps)(CategoryStateDetail)
