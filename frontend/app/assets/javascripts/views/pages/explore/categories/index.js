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
// LIBRARIES
// ----------------------------------------
import React, { Suspense, useEffect } from 'react'

import { connect } from 'react-redux'
import { fetchSharedCategoriesList } from 'providers/redux/reducers/fvCategory'
import { dictionaryListSmallScreenColumnDataTemplate } from 'views/components/Browsing/DictionaryListSmallScreen'

const DictionaryList = React.lazy(() => import('views/components/Browsing/DictionaryList'))

const getColumns = () => {
  return [
    {
      name: 'title',
      title: 'Shared Categories',
      columnDataTemplate: dictionaryListSmallScreenColumnDataTemplate.cellRender,
      render: (v) => {
        return (
          <p className="DictionaryList__link" href="/">
            {v}
          </p>
        )
      },
      sortBy: 'dc:title',
    },
  ]
}

export const Categories = (props) => {
  useEffect(() => {
    props.fetchSharedCategoriesList()
  }, [])

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DictionaryList
        hasSorting={false}
        hasPagination={false}
        hasViewModeButtons={false}
        columns={getColumns()}
        cssModifier="DictionaryList--contributors"
        items={props.computeFetchSharedCategoriesList.response.entries}
      />
    </Suspense>
  )
}

const mapStateToProps = ({ fvCategory }) => {
  const { computeFetchSharedCategoriesList } = fvCategory
  return {
    computeFetchSharedCategoriesList,
  }
}

const mapDispatchToProps = {
  fetchSharedCategoriesList,
}

export default connect(mapStateToProps, mapDispatchToProps)(Categories)
