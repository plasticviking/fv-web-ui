describe('DialectFilterList-Words.js > DialectFilterList', () => {
  it('Select category with enough results for pagination, confirm has data, navigate to next page, confirm has data', () => {
    cy.visit('/explore/FV/sections/Data/Test/Test/TestLanguageSix/learn/words')
    cy.wait(500)

    const category = 'TestCategory'
    cy.DialectFilterList({
      category,
      confirmData: true,
      shouldPaginate: true,
      clearFilter: true,
    })
  })
  it('FW-255: ‘Create’ button is not working after filtering by Category (Navigate to a category, click Create Word)', () => {
    cy.login({
      userName: 'TESTLANGUAGESIX_ADMIN',
    })
    cy.visit('/explore/FV/Workspaces/Data/Test/Test/TestLanguageSix/learn/words')
    cy.wait(500)

    const category = 'TestCategory'
    cy.DialectFilterList({
      category,
      confirmData: false,
      shouldPaginate: false,
      clearFilter: false,
    })
    cy.getByText('Create new word', {
      exact: false,
    }).click()
    cy.wait(500)
    cy.getByText('Add New Word to', {
      exact: false,
    }).should('exist')

    cy.log('Test complete')
  })

  it('FW-1106: After clearing a `filter by category`, clicking on sort re-enables filtering by category', () => {
    cy.login({
      userName: 'TESTLANGUAGESIX_ADMIN',
    })
    cy.visit('/explore/FV/Workspaces/Data/Test/Test/TestLanguageSix/learn/words')
    cy.wait(1000)

    const category = 'TestCategory'

    cy.DialectFilterList({
      category,
      confirmData: false,
      confirmActiveClass: true,
      activeClassName: 'DialectFilterListLink--active',
      shouldPaginate: false,
      clearFilter: true,
      clearFilterText: 'stop browsing by',
    })

    cy.get('.DictionaryList__data--title .DictionaryList__colSort').click()
    cy.wait(500)
    cy.getByTestId('DialectFilterList').within(() => {
      cy.getByText(category).should('not.have.class', 'DialectFilterListLink--active')
    })
  })

  it("FW-1105: When filtering by category, sorting doesn't work", () => {
    cy.login({
      userName: 'TESTLANGUAGESIX_ADMIN',
    })
    cy.visit('/explore/FV/sections/Data/Test/Test/TestLanguageSix/learn/words')
    cy.wait(1000)

    const category = 'TestCategory'

    cy.DialectFilterList({
      category,
      confirmData: false,
      shouldPaginate: false,
      clearFilter: false,
    })

    cy.queryAllByTestId('DictionaryList__row')
      .eq(0)
      .within(() => {
        cy.getByText('Dog').should('exist')
      })
    cy.get('.DictionaryList__data--title .DictionaryList__colSort').click()
    cy.wait(500)
    cy.queryAllByTestId('DictionaryList__row')
      .eq(0)
      .within(() => {
        cy.getByText('Tiger').should('exist')
      })
  })
})
