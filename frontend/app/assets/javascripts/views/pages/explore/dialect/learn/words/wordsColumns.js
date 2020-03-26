import React from 'react'
import selectn from 'selectn'
import Edit from '@material-ui/icons/Edit'
import AuthorizationFilter from 'views/components/Document/AuthorizationFilter'
import FVButton from 'views/components/FVButton'
import Link from 'views/components/Link'
import NavigationHelpers from 'common/NavigationHelpers'
import Preview from 'views/components/Editor/Preview'

import UIHelpers from 'common/UIHelpers'
import IntlService from 'views/services/intl'
import {
  dictionaryListSmallScreenColumnDataTemplate,
  dictionaryListSmallScreenColumnDataTemplateCustomInspectChildrenCellRender,
  dictionaryListSmallScreenColumnDataTemplateCustomAudio,
} from 'views/components/Browsing/DictionaryListSmallScreen'
import { WORKSPACES } from 'common/Constants'
const intl = IntlService.instance

export const getColumnsWords = (param) => {
  const { computedDialect2Response, DEFAULT_LANGUAGE, computeLogin, routeParams } = param
  const columns = [
    {
      name: 'title',
      title: intl.trans('word', 'Word', 'first'),
      columnDataTemplate: dictionaryListSmallScreenColumnDataTemplate.cellRender,
      render: (v, data) => {
        const isWorkspaces = routeParams.area === WORKSPACES
        const href = NavigationHelpers.generateUIDPath(routeParams.siteTheme, data, 'words')
        const hrefEdit = NavigationHelpers.generateUIDEditPath(routeParams.siteTheme, data, 'words')
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
                  // NavigationHelpers.navigate(hrefEditRedirect, this.props.pushWindowPath, false)
                }}
              >
                <Edit title={intl.trans('edit', 'Edit', 'first')} />
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
        const firstAudio = selectn('contextParameters.word.' + cellProps.name + '[0]', data)
        if (firstAudio) {
          return (
            <Preview
              key={selectn('uid', firstAudio)}
              minimal
              tagProps={{ preload: 'none' }}
              styles={{ padding: 0 }}
              tagStyles={{ width: '100%', minWidth: '230px' }}
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
        const firstPicture = selectn('contextParameters.word.' + cellProps.name + '[0]', data)
        if (firstPicture) {
          return (
            <img
              className="PrintHide itemThumbnail"
              key={selectn('uid', firstPicture)}
              src={UIHelpers.getThumbnail(firstPicture, 'Thumbnail')}
              alt=""
            />
          )
        }
      },
    },
    {
      name: 'fv-word:part_of_speech',
      title: intl.trans('part_of_speech', 'Part of Speech', 'first'),
      columnDataTemplate: dictionaryListSmallScreenColumnDataTemplate.cellRender,
      render: (v, data) => selectn('contextParameters.word.part_of_speech', data),
      sortBy: 'fv-word:part_of_speech',
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
