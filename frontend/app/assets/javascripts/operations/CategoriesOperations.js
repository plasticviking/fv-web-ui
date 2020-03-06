import StringHelpers from 'common/StringHelpers'
import BaseOperations from 'operations/BaseOperations'

export default class CategoryOperations {
  /*
   * fetchDocuments
   * --------------------------------------
   */
  static fetchSharedCategoriesList() {
    const properties = BaseOperations.getProperties()

    return new Promise((resolve, reject) => {
      properties.client
        .operation('Document.ListSharedCategories')
        .execute()
        .then((newDoc) => {
          resolve(newDoc)
        })
        .catch((error) => {
          error.response.json().then((jsonError) => {
            reject(StringHelpers.extractErrorMessage(jsonError))
          })
        })
    })
  }
}
