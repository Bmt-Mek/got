/// <reference types="cypress" />

// Custom commands for Game of Thrones Character Explorer

Cypress.Commands.add('loginDemo', () => {
  cy.visit('/login');
  cy.get('[data-cy=demo-button]').click();
  cy.get('[data-cy=login-button]').click();
  cy.url().should('include', '/characters');
  cy.get('[data-cy=user-menu]').should('be.visible');
});

Cypress.Commands.add('goToCharacters', () => {
  cy.visit('/characters');
  cy.get('[data-cy=characters-grid]').should('be.visible');
});

Cypress.Commands.add('searchCharacter', (name: string) => {
  cy.get('[data-cy=search-input]').clear().type(name);
  cy.get('[data-cy=search-input]').should('have.value', name);
  // Wait for debounced search
  cy.wait(500);
});

Cypress.Commands.add('addToFavorites', () => {
  cy.get('[data-cy=character-card]').first().within(() => {
    cy.get('[data-cy=favorite-button]').click();
  });
  cy.get('.mat-snack-bar-container').should('contain', 'Added to favorites');
});

Cypress.Commands.add('checkMobile', () => {
  cy.viewport('iphone-x');
  cy.get('[data-cy=mobile-nav]').should('be.visible');
});

// Prevent TypeScript errors
export {};