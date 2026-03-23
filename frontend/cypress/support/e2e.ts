// ***********************************************************
// This support file is processed and loaded automatically before test files
// ***********************************************************

// Import commands
import './commands'

// Hide fetch/XHR requests in command log for cleaner output
Cypress.on('uncaught:exception', (err, runnable) => {
  // Prevent Cypress from failing tests on uncaught exceptions
  // that we don't care about (e.g., third-party script errors)
  return false
})

// Custom viewport sizes for responsive testing
Cypress.Commands.add('setMobileViewport', () => {
  cy.viewport(375, 667) // iPhone SE size
})

Cypress.Commands.add('setTabletViewport', () => {
  cy.viewport(768, 1024) // iPad size
})

Cypress.Commands.add('setDesktopViewport', () => {
  cy.viewport(1280, 720) // Desktop size
})
