import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { List } from 'immutable'
import classNames from 'classnames'
import selectn from 'selectn'

import t from 'tcomb-form'

import ProviderHelpers from 'common/ProviderHelpers'
import NavigationHelpers from 'common/NavigationHelpers'

import { Popover } from '@material-ui/core'
import FVButton from 'views/components/FVButton'
import FVLabel from '../../components/FVLabel/index'
import { connect } from 'react-redux'

const confirmationButtonsStyle = { padding: '4px', marginLeft: '5px', border: '1px solid gray' }

export default function withForm(ComposedFilter /*, publishWarningEnabled = false*/) {
  class ViewWithForm extends Component {
    static propTypes = {
      // routeParams: PropTypes.object,
      initialValues: PropTypes.object,
      fields: PropTypes.object.isRequired,
      options: PropTypes.object.isRequired,
      type: PropTypes.string.isRequired,
      itemId: PropTypes.string.isRequired,
      saveMethod: PropTypes.func.isRequired,
      cancelMethod: PropTypes.func,
      currentPath: PropTypes.array,
      navigationMethod: PropTypes.func,
      computeEntities: PropTypes.instanceOf(List).isRequired,
    }

    static defaultProps = {
      cancelMethod: () => {},
    }

    constructor(props, context) {
      super(props, context)

      this.state = {
        formValue: null,
        showCancelWarning: false,
        saved: false,
      }
    }

    _getComputeItem(props) {
      const { computeEntities, itemId } = props

      const item = computeEntities.find((value /*, key*/) => value.get('id') === itemId)

      return ProviderHelpers.getEntry(item.get('entity'), itemId)
    }

    _onRequestSaveForm = (e, portal) => {
      // Prevent default behaviour
      e.preventDefault()
      const formValue = this['form_' + this.props.type].getValue()
      const properties = {}
      // Passed validation
      if (formValue) {
        for (const key in formValue) {
          if (formValue.hasOwnProperty(key) && key) {
            if (formValue[key] && formValue[key] !== '') {
              // Filter out null values in an array
              if (formValue[key] instanceof Array) {
                const formValueKey = formValue[key].filter((item) => item !== null)
                properties[key] = formValueKey
              } else {
                properties[key] = formValue[key]
              }
            }
          }
        }
        // console.log('same?', {properties,formValue})
        this.props.saveMethod(portal, properties)

        this.setState({
          saved: true,
          formValue: properties,
        })
      } else {
        window.scrollTo(0, 0)
      }
    }

    _onRequestCancelForm = (e, force = false) => {
      if (force) {
        if (this.props.cancelMethod) {
          this.props.cancelMethod()
        } else {
          NavigationHelpers.navigateUp(this.props.currentPath, this.props.navigationMethod)
        }
      } else {
        e.preventDefault()
      }

      this.setState({
        cancelButtonEl: e.currentTarget,
        showCancelWarning: true,
      })
    }

    componentWillReceiveProps(nextProps) {
      if (this.state.saved) {
        const currentWord = this._getComputeItem(this.props)
        const nextWord = this._getComputeItem(nextProps)

        const currentWordWasUpdated = selectn('wasUpdated', currentWord)
        const currentWordWasCreated = selectn('wasCreated', currentWord)

        const nextWordWasUpdated = selectn('wasUpdated', nextWord)
        const nextWordWasCreated = selectn('wasCreated', nextWord)

        // 'Redirect' on update or creation success
        if (
          (nextWordWasUpdated && currentWordWasUpdated != nextWordWasUpdated) ||
          (nextWordWasCreated && currentWordWasCreated != nextWordWasCreated)
        ) {
          if (nextWordWasUpdated) {
            NavigationHelpers.navigateUp(this.props.currentPath, this.props.navigationMethod)
          } else if (nextWordWasCreated) {
            //navigateForwardReplace
            //nextProps.replaceWindowPath('/' + nextProps.routeParams.siteTheme + selectn('response.path', nextWord).replace('Dictionary', 'learn/words'));
          }
        }
      }
    }

    render() {
      const { initialValues, fields, options, type } = this.props
      const computeItem = this._getComputeItem(this.props)
      return (
        <div className="row">
          <div className={classNames('col-xs-12', 'col-md-9')}>
            <ComposedFilter renderOnError {...this.props} {...this.state}>
              <div className="form-horizontal" style={{ padding: '0 15px' }}>
                <form
                  onSubmit={(e) => {
                    this._onRequestSaveForm(e, computeItem)
                  }}
                >
                  <div data-testid="withForm__btnGroup1" className="form-group" style={{ textAlign: 'right' }}>
                    <FVButton variant="flat" onClick={this._onRequestCancelForm} style={{ marginRight: '10px' }}>
                      {<FVLabel transKey="cancel" defaultStr="Cancel" transform="first" />}
                    </FVButton>
                    <button
                      type="submit"
                      onClick={(e) => {
                        this._onRequestSaveForm(e, computeItem)
                      }}
                      className="RaisedButton RaisedButton--primary"
                    >
                      {<FVLabel transKey="save" defaultStr="Save" transform="first" />}
                    </button>
                  </div>

                  <hr />

                  <t.form.Form
                    ref={(element) => {
                      this['form_' + type] = element
                    }}
                    type={t.struct(selectn(type, fields))}
                    context={initialValues}
                    value={this.state.formValue || selectn('response.properties', computeItem)}
                    options={selectn(type, options)}
                  />

                  <hr />

                  <div data-testid="withForm__btnGroup2" className="form-group" style={{ textAlign: 'right' }}>
                    <FVButton variant="flat" onClick={this._onRequestCancelForm} style={{ marginRight: '10px' }}>
                      <FVLabel transKey="cancel" defaultStr="Cancel" transform="first" />
                    </FVButton>
                    <button
                      type="submit"
                      onClick={(e) => {
                        this._onRequestSaveForm(e, computeItem)
                      }}
                      className="RaisedButton RaisedButton--primary"
                    >
                      <FVLabel transKey="save" defaultStr="Save" transform="first" />
                    </button>

                    <Popover
                      open={this.state.showCancelWarning}
                      anchorEl={this.state.cancelButtonEl}
                      anchorOrigin={{ horizontal: 'left', vertical: 'center' }}
                      transformOrigin={{ horizontal: 'right', vertical: 'center' }}
                      onClose={() => this.setState({ showCancelWarning: false })}
                    >
                      <div style={{ padding: '10px', margin: '0 15px', borderRadius: '5px' }}>
                        <span
                          dangerouslySetInnerHTML={{
                            __html: this.props.intl.trans(
                              'views.hoc.view.discard_warning',
                              'Are you sure you want to <strong>discard your changes</strong>?',
                              'first'
                            ),
                          }}
                        />
                        <FVButton
                          variant="flat"
                          size="small"
                          style={confirmationButtonsStyle}
                          onClick={(e) => {
                            this._onRequestCancelForm(e, true)
                          }}
                        >
                          <FVLabel transKey="yes" defaultStr="Yes" transform="first" />!
                        </FVButton>
                        <FVButton
                          variant="flat"
                          size="small"
                          style={confirmationButtonsStyle}
                          onClick={() => this.setState({ showCancelWarning: false })}
                        >
                          <FVLabel transKey="no" defaultStr="No" transform="first" />!
                        </FVButton>
                      </div>
                    </Popover>
                  </div>
                </form>
              </div>
            </ComposedFilter>
          </div>

          <div className={classNames('col-xs-12', 'col-md-3')}>
            <div style={{ marginTop: '25px' }} className={classNames('panel', 'panel-primary')}>
              <div className="panel-heading">Metadata</div>

              <ul className="list-group">
                <li className="list-group-item">
                  <span className={classNames('label', 'label-default')}>
                    <FVLabel transKey="last_modified" defaultStr="Last Modified" transform="first" />
                  </span>
                  <br />
                  {selectn('response.lastModified', computeItem)}
                </li>

                <li className="list-group-item">
                  <span className={classNames('label', 'label-default')}>
                    <FVLabel transKey="last_contributor" defaultStr="Last Contributor" transform="first" />
                  </span>
                  <br />
                  {selectn('response.properties.dc:lastContributor', computeItem)}
                </li>

                <li className="list-group-item">
                  <span className={classNames('label', 'label-default')}>
                    <FVLabel transKey="date_created" defaultStr="Date Added to FirstVoices" transform="first" />
                  </span>
                  <br />
                  {selectn('response.properties.dc:created', computeItem)}
                </li>

                <li className="list-group-item">
                  <span className={classNames('label', 'label-default')}>
                    <FVLabel transKey="contributors" defaultStr="Contributors" transform="first" />
                  </span>
                  <br />
                  {(selectn('response.properties.dc:contributors', computeItem) || []).join(',')}
                </li>

                <li className="list-group-item">
                  <span className={classNames('label', 'label-default')}>
                    <FVLabel transKey="version" defaultStr="Version" transform="first" />
                  </span>
                  <br />
                  {selectn('response.properties.uid:major_version', computeItem)}.
                  {selectn('response.properties.uid:minor_version', computeItem)}
                </li>
              </ul>
            </div>
          </div>
        </div>
      )
    }
  }

  const mapStateToProps = (state) => {
    const { locale } = state
    const { intlService } = locale

    return {
      intl: intlService,
    }
  }

  return connect(mapStateToProps)(ViewWithForm)
}
