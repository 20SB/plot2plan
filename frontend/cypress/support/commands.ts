/// <reference types="cypress" />

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to set mobile viewport
       * @example cy.setMobileViewport()
       */
      setMobileViewport(): Chainable<void>
      
      /**
       * Custom command to set tablet viewport
       * @example cy.setTabletViewport()
       */
      setTabletViewport(): Chainable<void>
      
      /**
       * Custom command to set desktop viewport
       * @example cy.setDesktopViewport()
       */
      setDesktopViewport(): Chainable<void>
      
      /**
       * Custom command to login
       * @example cy.login('test@example.com', 'password123')
       */
      login(email: string, password: string): Chainable<void>
      
      /**
       * Custom command to register
       * @example cy.register('John Doe', 'test@example.com', 'password123')
       */
      register(name: string, email: string, password: string, phone?: string): Chainable<void>
      
      /**
       * Custom command to check SEO meta tags
       * @example cy.checkSEO()
       */
      checkSEO(): Chainable<void>
      
      /**
       * Custom command to check branding colors
       * @example cy.checkBrandColors()
       */
      checkBrandColors(): Chainable<void>
    }
  }
}

// Login command
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.visit('/login')
  cy.get('input[name="email"]').type(email)
  cy.get('input[name="password"]').type(password)
  cy.get('button[type="submit"]').click()
})

// Register command
Cypress.Commands.add('register', (name: string, email: string, password: string, phone?: string) => {
  cy.visit('/register')
  cy.get('input[name="name"]').type(name)
  cy.get('input[name="email"]').type(email)
  cy.get('input[name="password"]').type(password)
  if (phone) {
    cy.get('input[name="phone"]').type(phone)
  }
  cy.get('button[type="submit"]').click()
})

// SEO meta tags check
Cypress.Commands.add('checkSEO', () => {
  // Check title
  cy.title().should('exist').and('not.be.empty')
  
  // Check meta description
  cy.get('head meta[name="description"]').should('exist').and('have.attr', 'content').and('not.be.empty')
  
  // Check Open Graph tags
  cy.get('head meta[property="og:title"]').should('exist')
  cy.get('head meta[property="og:description"]').should('exist')
  cy.get('head meta[property="og:type"]').should('exist')
  
  // Check Twitter tags
  cy.get('head meta[name="twitter:card"]').should('exist')
  cy.get('head meta[name="twitter:title"]').should('exist')
})

// Brand colors check
Cypress.Commands.add('checkBrandColors', () => {
  // Check for primary color (Deep Blue - #1E3A8A)
  cy.get('body').should('exist')
  
  // Verify brand elements exist
  cy.get('[class*="primary"]').should('exist')
  cy.get('[class*="secondary"]').should('exist')
})

export {}
