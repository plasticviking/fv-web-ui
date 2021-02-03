import React, { useEffect, useState } from 'react'
import propTypes from 'prop-types'
import { connect } from 'react-redux'
import selectn from 'selectn'

import { Snackbar, IconButton } from '@material-ui/core'
import { Close } from '@material-ui/icons'

import { toggleHelpMode, setEditingLabel } from 'reducers/locale'
import { fetchLabelDirectory } from 'reducers/directory'
import DocumentOperations from 'operations/DocumentOperations'

import LabelModal from 'components/Immersion/Modal'
import FVButton from 'components/FVButton/index'
import './HelperModeToggle.css'

const HelperModeToggle = ({
  handleToggleHelpMode,
  isInHelpMode,
  isImmersionModeOn,
  editingLabel,
  labelIds,
  computeDirectory,
  fetchLabelDirectory: _fetchLabelDirectory,
  intl,
  locale,
  routeParams,
  setEditingLabel: _setEditingLabel,
}) => {
  const [isNew, setIsNew] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [label, setLabel] = useState()
  const [fetched, setFetched] = useState(false)
  const [snackbarOpen, setSnackbarOpen] = useState(false)

  useEffect(() => {
    if (!fetched) {
      _fetchLabelDirectory('fv_labels', 'immersive_labels')
      setFetched(true)
    }
    if (editingLabel) {
      const uid = selectn(editingLabel, labelIds)
      setIsNew(!uid)
      const allLabels = selectn('directoryEntries.fv_labels', computeDirectory) || []

      const mappedLabel = allLabels.find((l) => {
        return l.id === editingLabel
      })

      const templateStrings = mappedLabel ? mappedLabel.template_strings.split(',') : []
      const _label = {
        labelKey: editingLabel,
        type: mappedLabel ? mappedLabel.type : 'phrase',
        templateStrings,
        base: intl.trans(editingLabel, 'Translated Label', null, templateStrings, null, null, locale),
        translation: undefined,
        uid,
        relatedAudio: undefined,
        state: 'N/A',
      }
      if (uid) {
        DocumentOperations.getDocument(uid, 'FVLabel').then((data) => {
          _label.relatedAudio = selectn('properties.fv:related_audio[0]', data)
          _label.translation = selectn('properties.dc:title', data)
          _label.state = selectn('state', data)
          setLabel(_label)
          setIsOpen(true)
        })
      } else {
        setLabel(_label)
        setIsOpen(true)
      }
    } else {
      setIsOpen(false)
    }
    return () => {
      setFetched(false)
    }
  }, [editingLabel])

  useEffect(() => {
    if (isInHelpMode) {
      setSnackbarOpen(true)
    } else {
      setSnackbarOpen(false)
    }
  }, [isInHelpMode])

  const closeModal = () => {
    setLabel(null)
    setIsOpen(false)
    _setEditingLabel()
  }

  const closeSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return
    }
    setSnackbarOpen(false)
  }

  return (
    <div className="helper-mode-toggle">
      {isImmersionModeOn && (
        <>
          <FVButton isFab onClick={handleToggleHelpMode}>
            {!isInHelpMode && <>Open Immersion Helper</>}
            {isInHelpMode && (
              <>
                Close Immersion Helper
                <Close />
              </>
            )}
          </FVButton>
          <LabelModal
            isNew={isNew}
            dialectPath={routeParams.dialect_path}
            open={isOpen}
            handleClose={() => closeModal()}
            label={label}
          />
          <Snackbar
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'center',
            }}
            open={snackbarOpen}
            autoHideDuration={6000}
            onClose={closeSnackbar}
            ContentProps={{
              'aria-describedby': 'message-id',
            }}
            message={
              <span id="message-id">Click on words with a red box around them to see their translation and audio.</span>
            }
            action={[
              <IconButton key="close" aria-label="Close" color="inherit" onClick={closeSnackbar}>
                <Close />
              </IconButton>,
            ]}
          />
        </>
      )}
    </div>
  )
}

const mapStateToProps = (state) => {
  const { locale, directory, navigation } = state
  const { isInHelpMode, editingLabel } = locale

  return {
    isInHelpMode,
    editingLabel,
    labelIds: locale.labelIds,
    intl: locale.intlService,
    locale: locale.locale,
    isImmersionModeOn: !!locale.immersionMode && !!locale.workspace,
    computeDirectory: directory.computeDirectory,
    routeParams: navigation.route.routeParams,
  }
}

const mapDispatchToProps = {
  handleToggleHelpMode: toggleHelpMode,
  fetchLabelDirectory,
  setEditingLabel,
}

const { bool, func, string, object } = propTypes

HelperModeToggle.propTypes = {
  isInHelpMode: bool.isRequired,
  isImmersionModeOn: bool.isRequired,
  handleToggleHelpMode: func.isRequired,
  fetchLabelDirectory: func.isRequired,
  setEditingLabel: func.isRequired,
  labelIds: object.isRequired,
  editingLabel: string,
  intl: object.isRequired,
  locale: string.isRequired,
  routeParams: object.isRequired,
}

export default connect(mapStateToProps, mapDispatchToProps)(HelperModeToggle)
