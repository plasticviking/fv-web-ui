import React from 'react'
import PropTypes from 'prop-types'
import ProviderHelpers from 'common/ProviderHelpers'
import StateLoading from 'views/components/Loading'
import StateErrorBoundary from 'views/components/ErrorBoundary'
import StateSuccessDefault from './states/successCreate'
import StateCreate from './states/create'

// Immutable
import Immutable, { Map } from 'immutable' // eslint-disable-line

// REDUX
import { connect } from 'react-redux'
// REDUX: actions/dispatch/func
import { pushWindowPath } from 'providers/redux/reducers/windowPath'
import { createCategory, fetchCategories } from 'providers/redux/reducers/fvCategory'
import { fetchDialect } from 'providers/redux/reducers/fvDialect'

import { getFormData, handleSubmit } from 'common/FormHelpers'

import AuthenticationFilter from 'views/components/Document/AuthenticationFilter'
import PromiseWrapper from 'views/components/Document/PromiseWrapper'

import { STATE_LOADING, STATE_DEFAULT, STATE_ERROR, STATE_SUCCESS, STATE_ERROR_BOUNDARY } from 'common/Constants'

import '!style-loader!css-loader!./styles.css'

let categoriesPath = undefined
let _computeCategories = undefined

const { array, element, func, number, object, string } = PropTypes

const categoryType = {
  title: { plural: 'Categories', singular: 'Category' },
  label: { plural: 'categories', singular: 'category' },
}

export class Category extends React.Component {
  static propTypes = {
    className: string,
    copy: object,
    groupName: string,
    breadcrumb: element,
    DEFAULT_PAGE: number,
    DEFAULT_PAGE_SIZE: number,
    DEFAULT_LANGUAGE: string,
    DEFAULT_SORT_COL: string,
    DEFAULT_SORT_TYPE: string,
    validator: object,
    // REDUX: reducers/state
    routeParams: object.isRequired,
    computeLogin: object.isRequired,
    computeCategories: object.isRequired,
    computeCreateCategory: object,
    computeCategory: object,
    computeDialect: object.isRequired,
    computeDialect2: object.isRequired,
    splitWindowPath: array.isRequired,
    // REDUX: actions/dispatch/func
    fetchCategories: func.isRequired,
    fetchDialect: func.isRequired,
    pushWindowPath: func.isRequired,
  }
  static defaultProps = {
    className: 'FormCategory',
    groupName: '',
    breadcrumb: null,
    DEFAULT_PAGE: 1,
    DEFAULT_PAGE_SIZE: 100,
    DEFAULT_LANGUAGE: 'english',
    DEFAULT_SORT_COL: 'dc:title',
    DEFAULT_SORT_TYPE: 'asc',
  }

  _commonInitialState = {
    errors: [],
    formData: {},
    isBusy: false,
  }
  state = {
    componentState: STATE_LOADING,
    ...this._commonInitialState,
  }
  // NOTE: Using callback refs since on old React
  // https://reactjs.org/docs/refs-and-the-dom.html#callback-refs
  form = null
  setFormRef = (_element) => {
    this.form = _element
  }

  async componentDidMount() {
    const { routeParams /*, filter*/ } = this.props

    const copy = this.props.copy
      ? this.props.copy
      : await import(/* webpackChunkName: "CategoriesInternationalization" */ './internationalization').then(
          (_copy) => {
            return _copy.default
          }
        )

    categoriesPath = `${routeParams.dialect_path}/${categoryType.title.plural}/`

    // Get data for computeDialect
    await this.props.fetchDialect('/' + this.props.routeParams.dialect_path)

    if (this.props.computeDialect.isError && this.props.computeDialect.error) {
      this.setState({
        componentState: STATE_DEFAULT,
        copy,
        errorMessage: this.props.computeDialect.error,
      })
      return
    }

    const validator = this.props.validator
      ? this.props.validator
      : await import(/* webpackChunkName: "CategoryValidator" */ './validator').then((_validator) => {
          return _validator.default
        })

    this._getData({ copy })

    // Flip to ready state...
    this.setState({
      componentState: STATE_DEFAULT,
      copy,
      validator,
      errorMessage: undefined,
    })
  }
  async componentDidUpdate() {
    const { computeCategories } = this.props

    _computeCategories = ProviderHelpers.getEntry(computeCategories, categoriesPath)
  }

  render() {
    let content = null
    switch (this.state.componentState) {
      case STATE_LOADING: {
        content = this._stateGetLoading()
        break
      }

      case STATE_DEFAULT: {
        content = this._stateGetCreate()
        break
      }
      case STATE_ERROR: {
        content = this._stateGetError()
        break
      }
      case STATE_SUCCESS: {
        content = this._stateGetSuccess()
        break
      }
      case STATE_ERROR_BOUNDARY: {
        content = this._stateGetErrorBoundary()
        break
      }
      default:
        content = <div>{/* Shouldn't get here */}</div>
    }

    return content
  }

  _stateGetLoading = () => {
    const { className } = this.props
    return <StateLoading className={className} copy={this.state.copy} />
  }
  _stateGetErrorBoundary = () => {
    return <StateErrorBoundary errorMessage={this.state.errorMessage} copy={this.state.copy} />
  }
  _stateGetCreate = () => {
    const { className, breadcrumb, groupName } = this.props
    const { errors, isBusy } = this.state
    return (
      <AuthenticationFilter
        login={this.props.computeLogin}
        anon={false}
        routeParams={this.props.routeParams}
        notAuthenticatedComponent={<StateErrorBoundary copy={this.state.copy} errorMessage={this.state.errorMessage} />}
      >
        <PromiseWrapper
          computeEntities={Immutable.fromJS([
            {
              id: `/${this.props.routeParams.dialect_path}`,
              entity: this.props.fetchDialect,
            },
          ])}
        >
          <StateCreate
            className={className}
            copy={this.state.copy}
            groupName={groupName}
            breadcrumb={breadcrumb}
            errors={errors}
            isBusy={isBusy}
            onRequestSaveForm={() => {
              this._onRequestSaveForm()
            }}
            setFormRef={this.setFormRef}
            dialectCategories={this._dialectCategories()}
          />
        </PromiseWrapper>
      </AuthenticationFilter>
    )
  }
  _stateGetError = () => {
    // _stateGetCreate() also handles errors, so just call it...
    return this._stateGetCreate()
  }
  _stateGetSuccess = () => {
    const { className } = this.props
    const { formData, itemUid } = this.state
    return (
      <StateSuccessDefault
        className={className}
        copy={this.state.copy}
        formData={formData}
        itemUid={itemUid}
        handleClick={() => {
          this.setState({
            componentState: STATE_DEFAULT,
            ...this._commonInitialState,
          })
        }}
      />
    )
  }

  _getData = async (addToState) => {
    const { routeParams } = this.props
    const { page } = routeParams

    let currentAppliedFilter = '' // eslint-disable-line
    // TODO: ASK DANIEL ABOUT `filter` & `filter.currentAppliedFilter`
    // if (filter.has('currentAppliedFilter')) {
    //   currentAppliedFilter = Object.values(filter.get('currentAppliedFilter').toJS()).join('')
    // }

    categoriesPath = `${routeParams.dialect_path}/${categoryType.title.plural}/`
    // WORKAROUND: DY @ 17-04-2019 - Mark this query as a "starts with" query. See DirectoryOperations.js for note
    const startsWithQuery = ProviderHelpers.isStartsWithQuery(currentAppliedFilter)

    await this.props.fetchCategories(
      categoriesPath,
      `${currentAppliedFilter}&currentPageIndex=${page - 1}&pageSize=200&sortOrder=${
        this.props.DEFAULT_SORT_TYPE
      }&sortBy=${this.props.DEFAULT_SORT_COL}${startsWithQuery}`
    )
    // NOTE: redux doesn't update on changes to deeply nested data, hence the manual re-render
    this.setState({
      rerender: Date.now(),
      ...addToState,
    })
  }

  _dialectCategories = () => {
    const dialectCategories = [
      {
        uid: `${this.props.routeParams.dialect_path}/${categoryType.title.plural}`,
        title: 'None',
      },
    ]
    if (_computeCategories && _computeCategories.isFetching === false && _computeCategories.success) {
      const entries = _computeCategories.response.entries
      let obj = {}
      // eslint-disable-next-line func-names
      entries.forEach(function(entry) {
        obj = {
          uid: entry.uid,
          title: entry.title,
        }
        dialectCategories.push(obj)
      })
    }
    return dialectCategories
  }

  _handleCreateItemSubmit = async (formData) => {
    // Submit here
    const now = Date.now()
    const name = formData['dc:title']

    const results = await this.props.createCategory(
      formData.parentRef, // parentDoc:
      {
        // docParams:
        type: 'FVCategory',
        name: name,
        parentRef: formData.parentRef,
        properties: {
          'dc:description': formData['dc:description'],
          'dc:title': formData['dc:title'],
        },
      },
      null,
      now
    )

    if (results.success === false) {
      this.setState({
        componentState: STATE_ERROR_BOUNDARY,
      })
      return
    }

    const response = results ? results.response : {}

    if (response && response.uid) {
      this.setState({
        errors: [],
        formData,
        itemUid: response.uid,
        componentState: STATE_SUCCESS,
        categoryPath: `${this.props.routeParams.dialect_path}/Categories/${formData['dc:title']}.${now}`,
      })
    } else {
      this.setState({
        componentState: STATE_ERROR_BOUNDARY,
      })
    }
  }
  _onRequestSaveForm = async () => {
    const formData = getFormData({
      formReference: this.form,
    })
    const valid = () => {
      this.setState(
        {
          isBusy: true,
        },
        () => {
          this._handleCreateItemSubmit(formData)
        }
      )
    }
    const invalid = (response) => {
      this.setState({
        errors: response.errors,
        componentState: STATE_ERROR,
      })
    }

    handleSubmit({
      validator: this.state.validator,
      formData,
      valid,
      invalid,
    })
  }
}

// REDUX: reducers/state
const mapStateToProps = (state /*, ownProps*/) => {
  const { fvCategory, fvDialect, windowPath, navigation, nuxeo } = state
  const { computeCategories, computeCreateCategory, computeCategory } = fvCategory
  const { computeDialect, computeDialect2 } = fvDialect
  const { splitWindowPath } = windowPath
  const { route } = navigation
  const { computeLogin } = nuxeo
  return {
    computeLogin,
    computeCategories,
    computeCreateCategory,
    computeCategory,
    routeParams: route.routeParams,
    computeDialect,
    computeDialect2,
    splitWindowPath,
  }
}

// REDUX: actions/dispatch/func
const mapDispatchToProps = {
  createCategory,
  fetchCategories,
  fetchDialect,
  pushWindowPath,
}

export default connect(mapStateToProps, mapDispatchToProps)(Category)
