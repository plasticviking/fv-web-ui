// NOTE: this file will be copied to `cypress/integration` and run from there,
// so imports paths will be based on that location!

describe('RecorderEnable-Word.js > RecorderEnable-Word', () => {
  it('Test to check that when a recorder enables a word, the request to the language admin is received.', () => {
    cy.exec('bash ./scripts/ResetWordLangFive.sh', { env: { TARGET: Cypress.env('TARGET') } })
      .its('stdout')
      .should('contain', 'Reset TestLanguageFive dictionary successfully.', { log: false })

    cy.wait(500)

    cy.login({
      userName: 'TESTLANGUAGEFIVE_RECORDER',
    })

    /*
      Checking to make sure a word currently exists.
    */
    cy.visit('/explore/FV/Workspaces/Data/Test/Test/TestLanguageFive/learn/words')
    cy.wait(3500)
    cy.getByTestId('DictionaryList__row').scrollIntoView()
    cy.getByTestId('DictionaryList__row').within(() => {
      cy.getByText('TestWord').should('exist')
      cy.getByText('TestTranslation').should('exist')
      cy.getByText('Noun').should('exist')
    })
    cy.wait(500)

    /*
      Click enable as Recorder and check that publish is not clickable.
    */
    cy.getByText('TestWord', { exact: false }).scrollIntoView()
    cy.getByText('TestWord').click()
    cy.wait(500)
    cy.getByTestId('pageContainer').within(() => {
      cy.get('.PageToolbar__request').within(() => {
        cy.get('.PageToolbar__button')
          .eq(0)
          .within(() => {
            cy.getByText('Enable')
            cy.getByText('(0)').click()
          })
      })
    })
    cy.getByText('Request to enable word successfully submitted!', { exact: true }).should('exist')
    cy.getByTestId('pageContainer').within(() => {
      cy.get('.PageToolbar__request').within(() => {
        cy.get('.PageToolbar__button')
          .eq(0)
          .within(() => {
            cy.getByText('Enable')
            cy.getByText('(1)').should('exist')
          })
        cy.get('.PageToolbar__button')
          .eq(2)
          .within(() => {
            cy.getByText('Publish').should('have.css', 'color', 'rgb(161, 161, 161)')
            cy.getByText('Publish').should('have.css', 'cursor', 'default')
          })
      })
    })
    cy.logout()

    /*
      Login as Admin and verify task exists / reject task.
    */
    cy.login({
      userName: 'TESTLANGUAGEFIVE_ADMIN',
    })
    cy.visit('/explore/FV/Workspaces/Data/Test/Test/TestLanguageFive/')
    cy.wait(500)
    cy.getByText('View My Tasks', { exact: false }).click()
    cy.getByText('Reject', { exact: true }).click()

    cy.logout()

    /*
      Login as Recorder and click enable again.
    */
    cy.login({
      userName: 'TESTLANGUAGEFIVE_RECORDER',
    })

    cy.visit('/explore/FV/Workspaces/Data/Test/Test/TestLanguageFive/learn/words')
    cy.wait(3500)
    cy.getByTestId('DictionaryList__row').scrollIntoView()
    cy.wait(1000)
    cy.getByTestId('DictionaryList__row').within(() => {
      cy.getByText('TestWord').click()
    })
    cy.wait(500)
    cy.getByTestId('pageContainer').within(() => {
      cy.get('.PageToolbar__request').within(() => {
        cy.get('.PageToolbar__button')
          .eq(0)
          .within(() => {
            cy.getByText('Enable')
            cy.getByText('(0)').click()
          })
      })
    })
    cy.getByText('Request to enable word successfully submitted!', { exact: true }).should('exist')
    cy.getByTestId('pageContainer').within(() => {
      cy.get('.PageToolbar__request').within(() => {
        cy.get('.PageToolbar__button')
          .eq(0)
          .within(() => {
            cy.getByText('Enable')
            cy.getByText('(1)').should('exist')
          })
        cy.get('.PageToolbar__button')
          .eq(2)
          .within(() => {
            cy.getByText('Publish').should('have.css', 'color', 'rgb(161, 161, 161)')
            cy.getByText('Publish').should('have.css', 'cursor', 'default')
          })
      })
    })
    cy.logout()

    /*
      Login as Admin and verify task exists / approve task.
    */
    cy.login({
      userName: 'TESTLANGUAGEFIVE_ADMIN',
    })
    cy.visit('/explore/FV/Workspaces/Data/Test/Test/TestLanguageFive/learn/words')
    cy.wait(500)
    cy.getByText('View My Tasks', { exact: true }).click()
    cy.getByText('Approve', { exact: true }).click()

    cy.logout()

    /*
      Login as Site Member and check that the word is visible once enabled.
     */
    cy.login({
      userName: 'TESTLANGUAGEFIVE_MEMBER',
    })
    cy.visit('/explore/FV/Workspaces/Data/Test/Test/TestLanguageFive/learn/words')
    cy.wait(3500)
    cy.getByTestId('DictionaryList__row').scrollIntoView()
    cy.getByTestId('DictionaryList__row').within(() => {
      cy.getByText('TestWord').should('exist')
      cy.getByText('TestTranslation').should('exist')
      cy.getByText('Noun').should('exist')
      cy.getByText('Enabled').should('exist')
    })
    cy.logout()

    /*
      Login as Recorder and verify that publish is now clickable.
     */
    cy.login({
      userName: 'TESTLANGUAGEFIVE_RECORDER',
    })

    cy.visit('/explore/FV/Workspaces/Data/Test/Test/TestLanguageFive/learn/words')
    cy.wait(3500)
    cy.getByTestId('DictionaryList__row').scrollIntoView()
    cy.wait(1000)
    cy.getByTestId('DictionaryList__row').within(() => {
      cy.getByText('TestWord').click()
    })
    cy.wait(500)
    cy.getByTestId('pageContainer').within(() => {
      cy.get('.PageToolbar__request').within(() => {
        cy.get('.PageToolbar__button')
          .eq(0)
          .within(() => {
            cy.getByText('Enable')
            cy.getByText('(0)').should('have.css', 'color', 'rgb(161, 161, 161)')
            cy.getByText('(0)').should('have.css', 'cursor', 'default')
          })
        cy.get('.PageToolbar__button')
          .eq(2)
          .within(() => {
            cy.getByText('Publish').should('have.css', 'cursor', 'pointer')
          })
      })
    })
  })
})
