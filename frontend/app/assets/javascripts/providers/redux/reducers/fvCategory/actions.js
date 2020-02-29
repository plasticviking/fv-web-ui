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
  FV_CATEGORY_UPDATE_START,
  FV_CATEGORY_UPDATE_SUCCESS,
  FV_CATEGORY_UPDATE_ERROR,
} from './actionTypes'
import { _delete, fetch, query, create } from 'providers/redux/reducers/rest'
import DirectoryOperations from 'operations/DirectoryOperations'
import CategoryOperations from 'operations/CategoryOperations'
import IntlService from 'views/services/intl'

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

export const updateCategory = (
  newDoc,
  newParentRef,
  messageStart = undefined,
  messageSuccess = undefined,
  messageError = undefined
) => {
  const _messageStart = IntlService.instance.searchAndReplace(messageStart)
  const _messageSuccess = IntlService.instance.searchAndReplace(messageSuccess)
  const _messageError = IntlService.instance.searchAndReplace(messageError)
  return (dispatch) => {
    dispatch({
      type: FV_CATEGORY_UPDATE_START,
      pathOrId: newDoc.uid,
      message:
        _messageStart === undefined
          ? IntlService.instance.translate({
              key: 'operations.update_started',
              default: 'Update Started',
              case: 'words',
            }) + '...'
          : _messageStart,
    })
    return CategoryOperations.updateCategory(newDoc, newParentRef)
      .then((response) => {
        const dispatchObj = {
          type: FV_CATEGORY_UPDATE_SUCCESS,
          message:
            _messageSuccess === undefined
              ? IntlService.instance.translate({
                  key: 'providers.document_updated_successfully',
                  default: 'Document updated successfully',
                  case: 'first',
                }) + '!'
              : _messageSuccess,
          response: response,
          pathOrId: newDoc.uid,
        }
        dispatch(dispatchObj)
        // modify for components
        dispatchObj.success = true
        return dispatchObj
      })
      .catch((error) => {
        const dispatchObj = {
          type: FV_CATEGORY_UPDATE_ERROR,
          message: _messageError || IntlService.instance.searchAndReplace(error),
          pathOrId: newDoc.uid,
        }
        dispatch(dispatchObj)
        // modify for components
        dispatchObj.success = false
        return dispatchObj
      })
  }
}
