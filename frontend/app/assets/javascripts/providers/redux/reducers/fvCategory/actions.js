import {
  FV_CATEGORIES_FETCH_START,
  FV_CATEGORIES_FETCH_SUCCESS,
  FV_CATEGORIES_FETCH_ERROR,
  FV_CATEGORIES_SHARED_FETCH_START,
  FV_CATEGORIES_SHARED_FETCH_SUCCESS,
  FV_CATEGORIES_SHARED_FETCH_ERROR,
  FV_CATEGORY_FETCH_ALL_START,
  FV_CATEGORY_FETCH_ALL_SUCCESS,
  FV_CATEGORY_FETCH_ALL_ERROR,
} from './actionTypes'
import { _delete, fetch, update, query, create } from 'providers/redux/reducers/rest'
import DirectoryOperations from 'operations/DirectoryOperations'

/*
 * fetch
 * --------------------------------------
 */
export const fetchSharedCategories = (pageProvider, headers = {}, params = {}) => {
  return (dispatch) => {
    dispatch({ type: FV_CATEGORIES_SHARED_FETCH_START })

    return DirectoryOperations.getDocumentsViaPageProvider(pageProvider, 'FVCategory', headers, params)
      .then((response) => {
        dispatch({ type: FV_CATEGORIES_SHARED_FETCH_SUCCESS, documents: response })
      })
      .catch((error) => {
        dispatch({ type: FV_CATEGORIES_SHARED_FETCH_ERROR, error: error })
      })
  }
}

export const fetchCategoriesAll = (path /*, type*/) => {
  return (dispatch) => {
    dispatch({ type: FV_CATEGORY_FETCH_ALL_START })

    return DirectoryOperations.getDocuments(path, 'FVCategory', '', { headers: { 'enrichers.document': 'ancestry' } })
      .then((response) => {
        dispatch({ type: FV_CATEGORY_FETCH_ALL_SUCCESS, documents: response })
      })
      .catch((error) => {
        dispatch({ type: FV_CATEGORY_FETCH_ALL_ERROR, error: error })
      })
  }
}

export const fetchCategoriesInPath = (path, queryAppend, headers = {}, params = {}) => {
  return (dispatch) => {
    dispatch({ type: FV_CATEGORIES_FETCH_START })

    return DirectoryOperations.getDocuments(path, 'FVCategory', queryAppend, headers, params)
      .then((response) => {
        dispatch({ type: FV_CATEGORIES_FETCH_SUCCESS, documents: response })
      })
      .catch((error) => {
        dispatch({ type: FV_CATEGORIES_FETCH_ERROR, error: error })
      })
  }
}

export const fetchCategory = fetch('FV_CATEGORY', 'FVCategory', {
  headers: { 'enrichers.document': 'ancestry, parentDoc, breadcrumb' },
})

export const fetchCategories = query('FV_CATEGORIES', 'FVCategory', {
  headers: { 'enrichers.document': 'ancestry, parentDoc, breadcrumb, children' },
})

/*
 * createCategory
 * --------------------------------------
 */
export const createCategory = create('FV_CATEGORY', 'FVCategory')

/*
 * deleteCategory
 * --------------------------------------
 */
export const deleteCategory = _delete('FV_CATEGORY')

/*
 * updateCategory
 * --------------------------------------
 */
export const updateCategory = update(
  'FV_CATEGORY',
  'FVCategory',
  { headers: { 'enrichers.document': 'ancestry, parentDoc, breadcrumb, permissions' } },
  false
)
