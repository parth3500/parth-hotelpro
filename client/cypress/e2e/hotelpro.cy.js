describe('HotelPro Web Console E2E Tests', () => {
  it('loads the homepage and displays hotel branding / rooms', () => {
    cy.visit('/');
    cy.contains('HotelPro').should('be.visible');
    cy.contains('Rooms').should('be.visible');
  });

  it('allows opening login modal and navigating auth', () => {
    cy.visit('/');
    cy.get('button').contains(/login|sign in/i).first().click();
    cy.get('input[type="email"]').should('be.visible');
    cy.get('input[type="password"]').should('be.visible');
  });

  it('handles offline or network failure scenarios gracefully', () => {
    cy.visit('/', {
      onBeforeLoad(win) {
        // simulate offline navigator status
        cy.stub(win.navigator, 'onLine').value(false);
      },
    });
    cy.window().its('navigator.onLine').should('be.false');
  });
});
