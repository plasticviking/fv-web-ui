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
// import Nuxeo from 'nuxeo'

// import StringHelpers from 'common/StringHelpers'
import BaseOperations from 'operations/BaseOperations'
import IntlService from 'views/services/intl'

export default class UserOperations {
  static getUser(username = '' /*, headers = {}, params = {}*/) {
    const properties = BaseOperations.getProperties()

    return new Promise((resolve, reject) => {
      properties.client
        .users()
        .fetch(username)
        .then((user) => {
          resolve(user)
        })
        .catch((/*error*/) => {
          reject(
            IntlService.instance.translate({
              key: 'operations.could_not_retrieve_current_user',
              default: 'Could not retrieve current user',
              case: 'first',
            }) + '.'
          )
        })
    })
  }

  static createUser(newUser) {
    const properties = BaseOperations.getProperties()

    return new Promise((resolve, reject) => {
      properties.client
        .users()
        .create(newUser)
        .then((user) => {
          resolve(user)
        })
        .catch((/*error*/) => {
          reject(
            IntlService.instance.translate({
              key: 'operations.could_not_create_new_user',
              default: 'Could not create new user',
              case: 'first',
            }) + '.'
          )
        })
    })
  }

  static updateUser(user) {
    const properties = BaseOperations.getProperties()

    return new Promise((resolve, reject) => {
      properties.client
        .users()
        .update(user)
        .then((_user) => {
          resolve(_user)
        })
        .catch((/*error*/) => {
          reject(
            IntlService.instance.translate({
              key: 'operations.could_not_update_user',
              default: 'Could not update user',
              case: 'first',
            }) + '.'
          )
        })
    })
  }

  /**
   * Gets current user object
   */
  static getCurrentUser(headers = {}, params = {}) {
    const properties = BaseOperations.getProperties()

    return new Promise((resolve, reject) => {
      properties.client
        .operation('User.Get')
        .params(params)
        .input()
        .execute()
        .then((user) => {
          properties.client
            .request('/user/' + user.uid, params)
            .get(headers)
            .then((userObj) => {
              resolve(userObj)
            })
            .catch((/*error*/) => {
              reject(
                IntlService.instance.translate({
                  key: 'operations.could_not_retrieve_current_user',
                  default: 'Could not retrieve current user',
                  case: 'first',
                }) + '.'
              )
            })
        })
        .catch((/*error*/) => {
          reject(
            IntlService.instance.translate({
              key: 'operations.could_not_retrieve_current_user',
              default: 'Could not retrieve current user',
              case: 'first',
            }) + '.'
          )
        })
    })
  }

  static getUserTasks(params = {}) {
    const properties = BaseOperations.getProperties()

    return new Promise((resolve, reject) => {
      properties.client
        .operation('Task.GetAssigned')
        .params(params)
        .execute()
        .then((tasks) => {
          // Go through each task and do another request to figure out what document type each one is
          /*tasks.map(function(task, i) {
                            properties.client.request('/id/' + task.docref)
                            .get()
                            .then((document) => {
                                task["doctype"] = document.type;
                                console.log("document.type");
                            }).catch((error) => { reject('Could not retrieve document.'); });
                        })

                      console.log(tasks);*/
          resolve(tasks)
        })
        .catch((/*error*/) => {
          reject(
            IntlService.instance.translate({
              key: 'operations.could_not_retrieve_user_tasks',
              default: 'Could not retrieve user tasks',
              case: 'first',
            }) + '.'
          )
        })
    })
  }

  static fvUpdateUser(username = '', languagePreference) {
    const properties = BaseOperations.getProperties()

    return properties.client.operation('FVUpdateUser').params({
      username,
      languagePreference,
      groupsAction: 'update',
    }).execute()
  }
}
