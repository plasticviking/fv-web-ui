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
import t from 'tcomb-form'

import { connect } from 'react-redux'
import ProviderHelpers from 'common/ProviderHelpers'

import selectn from 'selectn'
import options from 'models/schemas/options'
import fields from 'models/schemas/fields'
import FVButton from 'views/components/FVButton'
import FVLabel from 'views/components/FVLabel/index'
import AuthorizationFilter from 'views/components/Document/AuthorizationFilter/index'

import { DialogActions, DialogContent, DialogTitle, TextField, IconButton } from '@material-ui/core'
import CloseIcon from '@material-ui/icons/Close'
import { withStyles } from '@material-ui/core/styles'

import TranslationInput from './translationInput'
import '!style-loader!css-loader!./modalStyles.css'

/**
 * List view for words in immersion
 */
const { func, object, string } = PropTypes

const styles = (theme) => ({
  inputRoot: {
    padding: '0',
    marginBottom: '16px',
  },
  translationInput: {
    display: 'block',
    padding: '6px 12px',
    width: 'calc(100% - 24px)',
    fontSize: '14px',
    minHeight: '22px',
    lineHeight: '1.42857143',
    color: '#555555',
    backgroundColor: '#fff',
    backgroundImage: 'none',
    border: '1px solid #ccc',
    borderRadius: '4px',
    boxShadow: 'inset 0 1px 1px rgba(0, 0, 0, 0.075)',
    transition: 'border-color ease-in-out 0.15s, box-shadow ease-in-out 0.15s',
    '&:focus': {
      borderColor: '#66afe9',
      outline: '0',
      boxShadow: 'inset 0 1px 1px rgba(0, 0, 0, 0.075), 0 0 8px rgba(102, 175, 233, 0.6)',
    },
  },
  translationError: {
    borderColor: '#a94442',
    boxShadow: 'inset 0 1px 1px rgba(0, 0, 0, 0.075)',
    '&:focus': {
      borderColor: '#843534',
      boxShadow: 'inset 0 1px 1px rgba(0, 0, 0, 0.075), 0 0 6px #ce8483',
    },
  },
})

class ModalContent extends Component {
  static propTypes = {
    handleClose: func,
    handleSave: func,
    handleUnpublish: func,
    label: object,
    type: string.isRequired,
    dialectPath: string.isRequired,
    audioRef: object.isRequired,
    classes: object.isRequired,
    // redux
    computeDialect2: object.isRequired,
  }
  static defaultProps = {
    type: 'base',
  }

  constructor(props, context) {
    super(props, context)

    const { label, type } = this.props

    this.fields = Object.assign({}, selectn('FVLabel', fields))

    this.options = Object.assign({}, selectn('FVLabel', options))

    this.state = {
      translation: label ? this.mapTranslation(label[type]) : [],
      formValue: null,
      error: false,
      hadError: false,
    }
  }

  componentDidMount() {}

  componentDidUpdate(prevProps) {
    const { type, label } = this.props
    if (prevProps.label && label && prevProps.label[type] !== label[type]) {
      //   change label
      this.setState({ translation: this.mapTranslation(label[type]), error: false, hadError: false })
    } else if (prevProps.label && !label) {
      // empty label
      this.setState({ translation: [], error: false, hadError: false })
    } else if (!prevProps.label && label) {
      // new label
      this.setState({ translation: this.mapTranslation(label[type]), error: false, hadError: false })
    }
  }

  mapTranslation = (translation) => {
    const mappedTranslation = translation.split(/(%s)/g)
    if (mappedTranslation[0] === '%s') {
      mappedTranslation.splice(0, 0, '')
    }
    if (mappedTranslation[-1] === '%s') {
      mappedTranslation.push('')
    }
    return mappedTranslation
  }

  handleChange = (event, index) => {
    const newState = [...this.state.translation]
    newState[index] = event.target.value
    this.setState({
      translation: newState,
      error: false,
    })
  }

  handleSave = (publishing = false) => {
    const { handleSave } = this.props
    const { translation } = this.state
    if (
      translation
        .filter((s) => s !== '%s')
        .join('')
        .trim() === ''
    ) {
      this.setState({
        error: true,
        hadError: true,
      })
    } else {
      handleSave(translation, publishing)
    }
  }

  renderTranslation = (label) => {
    if (label.type === 'phrase') return label.base
    var translation = label.base
    var count = 0
    const words = translation.split(/(%s)/g).map((word, i) => {
      if (word === '%s') {
        const chip = (
          <span className="template-span" key={i}>
            {label.templateStrings[count]}
          </span>
        )
        count++
        return chip
      } else {
        return <span key={i}>{word}</span>
      }
    })
    return words
  }

  scriptTranslation = (label) => {
    const { translation } = this.state
    var words = translation.join('')
    label.templateStrings.forEach((string) => {
      words = words.replace('%s', string)
    })
    return words
  }

  render() {
    const { handleClose, handleUnpublish, label, audioRef, dialectPath, computeDialect2, classes } = this.props
    const { translation, formValue, error, hadError } = this.state

    const _computeDialect2 = ProviderHelpers.getEntry(computeDialect2, dialectPath)
    return (
      <>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingRight: '24px',
          }}
        >
          <DialogTitle id="responsive-dialog-title">Edit label</DialogTitle> {/* need locale key */}
          <IconButton key="close" aria-label="Close" onClick={() => handleClose()}>
            <CloseIcon />
          </IconButton>
        </div>
        <DialogContent>
          <fieldset>
            <legend>Label Information</legend>
            {/* need locale key */}
            <label className="control-label">
              <FVLabel
                transKey="original_associated_word_phrase"
                defaultStr="Original Associated Word/Phrase"
                transform="words"
              />
            </label>
            <div style={{ padding: '15px' }}>{this.renderTranslation(label)}</div>
            <div style={{ display: 'flex' }}>
              <div style={{ width: '50%' }}>
                <label className="control-label">
                  <FVLabel transKey="category" defaultStr="Category" transform="words" />
                </label>{' '}
                <div style={{ padding: '15px' }}>{label.category}</div>
              </div>
              <div style={{ width: '50%' }}>
                <label className="control-label">
                  <FVLabel transKey="state" defaultStr="State" transform="words" />
                </label>
                <div style={{ padding: '15px' }}>{label.state}</div>
              </div>
            </div>
          </fieldset>
          <fieldset>
            <legend>Immersive Information</legend>
            {/* need locale key */}
            <div className="alert alert-info">
              <i>This will show for the site's 'Immersion' experience.</i>
              {/* need locale key */}
            </div>
            <div className={error || hadError ? 'has-error' : ''}>
              <label className="control-label">
                <FVLabel transKey="translation" defaultStr="Translation" transform="words" /> *
              </label>
              {label.type === 'phrase' ? (
                <TextField
                  id="translation"
                  fullWidth
                  multiline
                  required
                  rowsMax="4"
                  value={translation[0]}
                  onChange={(ev) => this.handleChange(ev, 0)}
                  margin="normal"
                  className=""
                  InputProps={{
                    disableUnderline: true,
                    classes: {
                      root: classes.inputRoot,
                      input: classes.translationInput,
                      error: classes.translationError,
                    },
                  }}
                  error={error || hadError}
                />
              ) : (
                <div>
                  <TranslationInput
                    templateStrings={label.templateStrings}
                    translation={translation}
                    onChange={this.handleChange}
                  />
                </div>
              )}
              {error && (
                <span className="help-block error-block">
                  <FVLabel
                    transKey="models.value_in_field_x_cannot_be_empty"
                    defaultStr="Value in field 'translation' cannot be empty"
                    transform="first"
                    params={['"Translation"']}
                  />
                </span>
              )}
            </div>

            <div className="related-audio">
              <t.form.Form
                ref={audioRef}
                type={t.struct(this.fields)}
                context={selectn('response', _computeDialect2)}
                value={label.relatedAudio ? { 'fv:related_audio': [label.relatedAudio] } : formValue}
                options={this.options}
              />
            </div>
          </fieldset>
        </DialogContent>
        <DialogActions style={{ justifyContent: 'space-between' }}>
          <div>
            <FVButton variant="flat" onClick={() => handleClose()} style={{ marginRight: '10px' }}>
              <FVLabel transKey="cancel" defaultStr="Cancel" transform="first" />
            </FVButton>
            {label.state === 'Published' && (
              <FVButton variant="flat" onClick={() => handleUnpublish()} style={{ marginRight: '10px' }}>
                <FVLabel transKey="unpublish" defaultStr="Unpublish" transform="first" />
              </FVButton>
            )}
          </div>
          {label.uid ? (
            <div>
              <button
                type="submit"
                onClick={() => {
                  this.handleSave()
                }}
                className="RaisedButton"
              >
                <FVLabel transKey="save" defaultStr="Save" transform="first" />
              </button>
              <AuthorizationFilter filter={{ permission: 'Write', entity: selectn('response', _computeDialect2) }}>
                <button
                  style={{ marginLeft: '10px' }}
                  type="submit"
                  onClick={() => {
                    this.handleSave(true)
                  }}
                  className="RaisedButton RaisedButton--primary"
                >
                  <FVLabel transKey="publish" defaultStr="Publish Changes" transform="first" />
                </button>
              </AuthorizationFilter>
            </div>
          ) : (
            <button
              type="submit"
              onClick={() => {
                this.handleSave()
              }}
              className="RaisedButton RaisedButton--primary"
            >
              <FVLabel transKey="save" defaultStr="Save" transform="first" />
            </button>
          )}
        </DialogActions>
      </>
    )
  }
}

// REDUX: reducers/state
const mapStateToProps = (state /*, ownProps*/) => {
  const { fvDialect } = state

  const { computeDialect2 } = fvDialect
  return {
    computeDialect2,
  }
}

// REDUX: actions/dispatch/func
const mapDispatchToProps = {}

export default withStyles(styles)(connect(mapStateToProps, mapDispatchToProps)(ModalContent))
