import React from 'react'
import selectn from 'selectn'
import Edit from '@material-ui/icons/Edit'
import AuthorizationFilter from 'views/components/Document/AuthorizationFilter'
import FVButton from 'views/components/FVButton'
import Link from 'views/components/Link'
import NavigationHelpers from 'common/NavigationHelpers'
import Preview from 'views/components/Editor/Preview'
import StringHelpers from 'common/StringHelpers'
import UIHelpers from 'common/UIHelpers'
import IntlService from 'views/services/intl'
import {
  dictionaryListSmallScreenColumnDataTemplate,
  dictionaryListSmallScreenColumnDataTemplateCustomInspectChildren,
  dictionaryListSmallScreenColumnDataTemplateCustomInspectChildrenCellRender,
  dictionaryListSmallScreenColumnDataTemplateCustomAudio,
} from 'views/components/Browsing/DictionaryListSmallScreen'
import { WORKSPACES } from 'common/Constants'
const intl = IntlService.instance

export const getColumnsPhrases = ({
  computedDialect2Response,
  computeLogin,
  DEFAULT_LANGUAGE = 'english',
  routeParams,
}) => {
  const currentTheme = routeParams.siteTheme
  const columns = [
    {
      name: 'title',
      title: intl.trans('phrase', 'Phrase', 'first'),
      columnDataTemplate: dictionaryListSmallScreenColumnDataTemplate.cellRender,
      render: (v, data) => {
        const href = NavigationHelpers.generateUIDPath(currentTheme, data, 'phrases')

        const isWorkspaces = routeParams.area === WORKSPACES
        const hrefEdit = NavigationHelpers.generateUIDEditPath(currentTheme, data, 'phrases')
        const hrefEditRedirect = `${hrefEdit}?redirect=${encodeURIComponent(
          `${window.location.pathname}${window.location.search}`
        )}`

        const editButton =
          isWorkspaces && hrefEdit ? (
            <AuthorizationFilter
              filter={{
                entity: computedDialect2Response,
                login: computeLogin,
                role: ['Record', 'Approve', 'Everything'],
              }}
              hideFromSections
              routeParams={routeParams}
            >
              <FVButton
                type="button"
                variant="flat"
                size="small"
                component="a"
                className="DictionaryList__linkEdit PrintHide"
                href={hrefEditRedirect}
                onClick={(e) => {
                  e.preventDefault()
                  // NavigationHelpers.navigate(hrefEditRedirect, pushWindowPath, false)
                }}
              >
                <Edit title={intl.trans('edit', 'Edit', 'first')} />
                {/* <span>{intl.trans('edit', 'Edit', 'first')}</span> */}
              </FVButton>
            </AuthorizationFilter>
          ) : null
        return (
          <>
            <Link className="DictionaryList__link DictionaryList__link--indigenous" href={href}>
              {v}
            </Link>
            {editButton}
          </>
        )
      },
      sortName: 'fv:custom_order',
      sortBy: 'fv:custom_order',
    },
    {
      name: 'fv:definitions',
      title: intl.trans('definitions', 'Definitions', 'first'),
      columnDataTemplate: dictionaryListSmallScreenColumnDataTemplate.custom,
      columnDataTemplateCustom: dictionaryListSmallScreenColumnDataTemplateCustomInspectChildrenCellRender,
      render: (v, data, cellProps) => {
        return UIHelpers.generateOrderedListFromDataset({
          dataSet: selectn(`properties.${cellProps.name}`, data),
          extractDatum: (entry, i) => {
            if (entry.language === DEFAULT_LANGUAGE && i < 2) {
              return entry.translation
            }
            return null
          },
          classNameList: 'DictionaryList__definitionList',
          classNameListItem: 'DictionaryList__definitionListItem',
        })
      },
      sortName: 'fv:definitions/0/translation',
    },
    {
      name: 'related_audio',
      title: intl.trans('audio', 'Audio', 'first'),
      columnDataTemplate: dictionaryListSmallScreenColumnDataTemplate.custom,
      columnDataTemplateCustom: dictionaryListSmallScreenColumnDataTemplateCustomAudio,
      render: (v, data, cellProps) => {
        const firstAudio = selectn('contextParameters.phrase.' + cellProps.name + '[0]', data)
        if (firstAudio) {
          return (
            <Preview
              minimal
              styles={{ padding: 0 }}
              tagStyles={{ width: '100%', minWidth: '230px' }}
              key={selectn('uid', firstAudio)}
              expandedValue={firstAudio}
              type="FVAudio"
            />
          )
        }
      },
    },
    {
      name: 'related_pictures',
      width: 72,
      textAlign: 'center',
      title: intl.trans('picture', 'Picture', 'first'),
      columnDataTemplate: dictionaryListSmallScreenColumnDataTemplate.cellRender,
      render: (v, data, cellProps) => {
        const firstPicture = selectn('contextParameters.phrase.' + cellProps.name + '[0]', data)
        if (firstPicture) {
          return (
            <img
              className="PrintHide itemThumbnail"
              key={selectn('uid', firstPicture)}
              src={UIHelpers.getThumbnail(firstPicture, 'Thumbnail')}
            />
          )
        }
      },
    },
    {
      name: 'fv-phrase:phrase_books',
      title: intl.trans('phrase_books', 'Phrase Books', 'words'),
      columnDataTemplate: dictionaryListSmallScreenColumnDataTemplate.custom,
      columnDataTemplateCustom: dictionaryListSmallScreenColumnDataTemplateCustomInspectChildren,
      render: (v, data) => {
        return UIHelpers.generateDelimitedDatumFromDataset({
          dataSet: selectn('contextParameters.phrase.phrase_books', data),
          extractDatum: (entry) => selectn('dc:title', entry),
        })
      },
    },
    {
      name: 'dc:modified',
      width: 210,
      title: intl.trans('date_modified', 'Date Modified'),
      render: (v, data) => {
        return StringHelpers.formatUTCDateString(selectn('lastModified', data))
      },
    },
    {
      name: 'dc:created',
      width: 210,
      title: intl.trans('date_created', 'Date Added to FirstVoices'),
      render: (v, data) => {
        return StringHelpers.formatUTCDateString(selectn('properties.dc:created', data))
      },
    },
  ]

  // NOTE: Append `categories` & `state` columns if on Workspaces
  if (routeParams.area === WORKSPACES) {
    columns.push({
      name: 'fv-word:categories',
      title: intl.trans('categories', 'Categories', 'first'),
      render: (v, data) => {
        return UIHelpers.generateDelimitedDatumFromDataset({
          dataSet: selectn('contextParameters.word.categories', data),
          extractDatum: (entry) => selectn('dc:title', entry),
        })
      },
    })

    columns.push({
      name: 'state',
      title: intl.trans('state', 'State', 'first'),
    })
  }

  return columns
}
