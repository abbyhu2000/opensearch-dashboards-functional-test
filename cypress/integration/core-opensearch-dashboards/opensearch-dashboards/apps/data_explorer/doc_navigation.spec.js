/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { MiscUtils } from '@opensearch-dashboards-test/opensearch-dashboards-test-library';

const miscUtils = new MiscUtils(cy);

describe('doc link in discover', () => {
  beforeEach(() => {
    cy.setAdvancedSetting({
      defaultIndex: 'logstash-*',
    });

    miscUtils.visitPage(
      `app/data-explorer/discover#/?_g=(filters:!(),time:(from:'2015-09-19T13:31:44.000Z',to:'2015-09-24T01:31:44.000Z'))`
    );
    cy.waitForLoader();
    cy.waitForSearch();
  });

  it('should open the doc view of the selected document', function () {
    cy.getElementByTestId(`docTableExpandToggleColumn-0`)
      .should('be.visible')
      .click();
    cy.getElementByTestId(`documentDetailFlyOut`).should('be.visible');

    // Both actions will take to the new tab
    cy.getElementByTestId('docTableRowAction').contains('View single document');

    cy.getElementByTestId('docTableRowAction').contains(
      'View surrounding documents'
    );
  });

  it('if value is null, add filter should create a non-exist filter', function () {
    // Filter out special document
    cy.getElementByTestId('addFilter').click();
    cy.getElementByTestId('filterFieldSuggestionList')
      .should('be.visible')
      .click()
      .type(`agent{downArrow}{enter}`)
      .trigger('blur', { force: true });

    cy.getElementByTestId('filterOperatorList')
      .should('be.visible')
      .click()
      .type(`is{downArrow}{enter}`)
      .trigger('blur', { force: true });

    cy.getElementByTestId('filterParams').type('Missing/Fields');

    cy.getElementByTestId('saveFilter').click({ force: true });
    cy.waitForLoader();

    cy.waitForSearch();

    cy.getElementByTestId(`docTableExpandToggleColumn-0`)
      .should('be.visible')
      .click();
    cy.getElementByTestId(`documentDetailFlyOut`).should('be.visible');

    cy.getElementByTestId('tableDocViewRow-referer')
      .find(`[data-test-subj="addInclusiveFilterButton"]`)
      .click();

    // Since the value of referer is null, the filter for value option will add a non-existing filter
    cy.get('[data-test-subj~="filter-key-referer"]').should('be.visible');
    cy.get('[data-test-subj~="filter-negated"]').should('be.visible');

    // Filter out value option will add an existing filter
    cy.getElementByTestId(`docTableExpandToggleColumn-0`)
      .should('be.visible')
      .click();

    cy.getElementByTestId('tableDocViewRow-referer')
      .find(`[data-test-subj="removeInclusiveFilterButton"]`)
      .click();
    cy.get('[data-test-subj~="filter-key-referer"]').should('be.visible');
    cy.get('[data-test-subj~="filter-value-exists"]').should('be.visible');
  });
});