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
export const createCategory = (parentDoc, docParams) => {
  return (dispatch) => {

    dispatch( { type: FV_CATEGORY_CREATE_START, document: docParams } );

    return DocumentOperations.createDocument(parentDoc, docParams)
      .then((response) => {
        dispatch( { type: FV_CATEGORY_CREATE_SUCCESS, document: response} );
      }).catch((error) => {
          dispatch( { type: FV_CATEGORY_CREATE_ERROR, error: error } )
    });
  }
};
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

/*
export const fetchCategory = (pathOrId) => {
  return (dispatch) => {

    let categories = {};
    categories[pathOrId] = {};

    dispatch( { type: FV_CATEGORY_FETCH_START, categories: categories, pathOrId: pathOrId } );

    return DocumentOperations.getDocument(pathOrId, 'FVCategory', { headers: { 'enrichers.document': 'ancestry, breadcrumb' } })
    .then((response) => {

      categories[pathOrId] = { response: response };

      dispatch( { type: FV_CATEGORY_FETCH_SUCCESS, categories: categories, pathOrId: pathOrId } )
    }).catch((error) => {

        categories[pathOrId] = { error: error };

        dispatch( { type: FV_CATEGORY_FETCH_ERROR, categories: categories, pathOrId: pathOrId } )
    });
  }
};
*/

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
  { headers: { 'enrichers.document': 'ancestry,breadcrumb,permissions' } },
  false
)
