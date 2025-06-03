describe('Game of Thrones Character Explorer', () => {
  beforeEach(() => {
    // Start fresh for each test
    cy.clearLocalStorage();
    cy.clearCookies();
  });

  describe('Landing Page', () => {
    it('should display the landing page correctly', () => {
      cy.visit('/');
      cy.contains('Explore the World of Game of Thrones');
      cy.get('[data-cy=hero-section]').should('be.visible');
      cy.get('[data-cy=features-section]').should('be.visible');
      cy.get('[data-cy=stats-section]').should('be.visible');
    });

    it('should navigate to characters page from CTA', () => {
      cy.visit('/');
      cy.get('[data-cy=explore-button]').click();
      cy.url().should('include', '/characters');
    });

    it('should navigate to auth pages', () => {
      cy.visit('/');
      cy.get('[data-cy=login-link]').click();
      cy.url().should('include', '/login');
      
      cy.visit('/');
      cy.get('[data-cy=register-link]').click();
      cy.url().should('include', '/register');
    });
  });

  describe('Authentication', () => {
    it('should register a new user', () => {
      cy.visit('/register');
      
      const timestamp = Date.now();
      const email = `test${timestamp}@example.com`;
      
      cy.get('[data-cy=first-name-input]').type('Test');
      cy.get('[data-cy=last-name-input]').type('User');
      cy.get('[data-cy=email-input]').type(email);
      cy.get('[data-cy=password-input]').type('password123');
      cy.get('[data-cy=confirm-password-input]').type('password123');
      cy.get('[data-cy=terms-checkbox]').check();
      cy.get('[data-cy=register-button]').click();
      
      cy.url().should('include', '/characters');
      cy.get('[data-cy=user-menu]').should('be.visible');
    });

    it('should login with demo credentials', () => {
      cy.loginDemo();
    });

    it('should show validation errors for invalid inputs', () => {
      cy.visit('/login');
      cy.get('[data-cy=login-button]').click();
      cy.get('.mat-error').should('contain', 'Email is required');
      
      cy.get('[data-cy=email-input]').type('invalid-email');
      cy.get('.mat-error').should('contain', 'Please enter a valid email');
    });

    it('should logout successfully', () => {
      cy.loginDemo();
      cy.get('[data-cy=user-menu]').click();
      cy.get('[data-cy=logout-button]').click();
      cy.url().should('eq', Cypress.config().baseUrl + '/');
    });
  });

  describe('Characters List', () => {
    beforeEach(() => {
      cy.goToCharacters();
    });

    it('should display characters list', () => {
      cy.get('[data-cy=characters-grid]').should('be.visible');
      cy.get('[data-cy=character-card]').should('have.length.greaterThan', 0);
      cy.get('[data-cy=pagination]').should('be.visible');
    });

    it('should search for characters', () => {
      cy.searchCharacter('Jon');
      cy.get('[data-cy=character-card]').should('have.length.lessThan', 10);
    });

    it('should navigate to character detail', () => {
      cy.get('[data-cy=character-card]').first().click();
      cy.url().should('include', '/characters/');
      cy.get('[data-cy=character-detail]').should('be.visible');
    });

    it('should use advanced filters', () => {
      cy.get('[data-cy=advanced-filters-toggle]').click();
      cy.get('[data-cy=gender-filter]').select('Male');
      cy.get('[data-cy=apply-filters-button]').click();
      cy.get('[data-cy=character-card]').should('have.length.greaterThan', 0);
    });

    it('should handle pagination', () => {
      cy.get('[data-cy=next-page-button]').click();
      cy.url().should('include', 'page=2');
      cy.get('[data-cy=character-card]').should('have.length.greaterThan', 0);
    });
  });

  describe('Favorites', () => {
    beforeEach(() => {
      cy.loginDemo();
      cy.goToCharacters();
    });

    it('should add character to favorites', () => {
      cy.addToFavorites();
      cy.get('[data-cy=favorites-count]').should('contain', '1');
    });

    it('should remove character from favorites', () => {
      cy.addToFavorites();
      cy.get('[data-cy=character-card]').first().within(() => {
        cy.get('[data-cy=favorite-button]').click();
      });
      cy.get('.mat-snack-bar-container').should('contain', 'Removed from favorites');
    });

    it('should view favorites page', () => {
      cy.addToFavorites();
      cy.get('[data-cy=favorites-nav-link]').click();
      cy.url().should('include', '/favorites');
      cy.get('[data-cy=favorites-grid]').should('be.visible');
      cy.get('[data-cy=character-card]').should('have.length', 1);
    });

    it('should clear all favorites', () => {
      cy.addToFavorites();
      cy.get('[data-cy=favorites-nav-link]').click();
      cy.get('[data-cy=clear-all-button]').click();
      cy.get('[data-cy=confirm-button]').click();
      cy.get('[data-cy=empty-state]').should('be.visible');
    });
  });

  describe('Character Detail', () => {
    beforeEach(() => {
      cy.goToCharacters();
      cy.get('[data-cy=character-card]').first().click();
    });

    it('should display character information', () => {
      cy.get('[data-cy=character-detail]').should('be.visible');
      cy.get('[data-cy=character-name]').should('not.be.empty');
      cy.get('[data-cy=character-info]').should('be.visible');
    });

    it('should toggle favorite from detail page', () => {
      cy.get('[data-cy=favorite-toggle]').click();
      cy.get('.mat-snack-bar-container').should('contain', 'Added to favorites');
    });

    it('should navigate back to characters list', () => {
      cy.get('[data-cy=back-button]').click();
      cy.url().should('include', '/characters');
    });
  });

  describe('Responsive Design', () => {
    it('should work on mobile devices', () => {
      cy.checkMobile();
      cy.visit('/');
      cy.get('[data-cy=mobile-hero]').should('be.visible');
      
      cy.goToCharacters();
      cy.get('[data-cy=mobile-search]').should('be.visible');
    });

    it('should work on tablet devices', () => {
      cy.viewport('ipad-2');
      cy.visit('/');
      cy.get('[data-cy=hero-section]').should('be.visible');
      
      cy.goToCharacters();
      cy.get('[data-cy=characters-grid]').should('be.visible');
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', () => {
      cy.intercept('GET', '**/characters**', { forceNetworkError: true }).as('networkError');
      cy.goToCharacters();
      cy.wait('@networkError');
      cy.get('[data-cy=error-message]').should('be.visible');
      cy.get('[data-cy=retry-button]').should('be.visible');
    });

    it('should handle 404 routes', () => {
      cy.visit('/non-existent-route');
      cy.url().should('eq', Cypress.config().baseUrl + '/');
    });
  });

  describe('Performance', () => {
    it('should load the app within acceptable time', () => {
      const start = Date.now();
      cy.visit('/');
      cy.get('[data-cy=hero-section]').should('be.visible').then(() => {
        const loadTime = Date.now() - start;
        expect(loadTime).to.be.lessThan(3000); // 3 seconds
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper headings structure', () => {
      cy.visit('/');
      cy.get('h1').should('exist');
      cy.get('h2').should('exist');
    });

    it('should have proper form labels', () => {
      cy.visit('/login');
      cy.get('label[for="email"]').should('exist');
      cy.get('label[for="password"]').should('exist');
    });

    it('should support keyboard navigation', () => {
      cy.visit('/');
      cy.get('body').tab();
      cy.focused().should('have.attr', 'href');
    });
  });
});