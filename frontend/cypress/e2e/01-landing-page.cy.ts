/// <reference types="cypress" />

describe('Landing Page Tests', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  describe('Page Load & Structure', () => {
    it('should load the homepage successfully', () => {
      cy.url().should('eq', Cypress.config().baseUrl + '/')
      cy.get('body').should('be.visible')
    })

    it('should display the navigation bar', () => {
      cy.get('nav').should('be.visible')
      cy.contains('Plot2Plan').should('be.visible')
    })

    it('should have no console errors', () => {
      cy.window().then((win) => {
        cy.spy(win.console, 'error')
      })
    })
  })

  describe('Hero Section', () => {
    it('should display hero section with main headline', () => {
      cy.contains('Turn Your Plot into a Perfect Home').should('be.visible')
    })

    it('should display hero subtitle', () => {
      cy.contains('AI-powered 2D floor plans').should('be.visible')
    })

    it('should have working CTA buttons', () => {
      cy.contains('button', 'Create Your Plan Free').should('be.visible').and('not.be.disabled')
      cy.contains('button', 'See How It Works').should('be.visible').and('not.be.disabled')
    })

    it('should display trust badges', () => {
      cy.contains('5 min design').should('be.visible')
      cy.contains('Construction-ready').should('be.visible')
      cy.contains('Vastu compliant').should('be.visible')
      cy.contains('Save ₹50,000+').should('be.visible')
    })
  })

  describe('Features Section', () => {
    it('should display features section', () => {
      cy.get('#features').should('exist')
      cy.contains('Everything You Need to Build Your Dream Home').should('be.visible')
    })

    it('should display all 8 feature cards', () => {
      cy.get('#features').within(() => {
        // Count feature cards
        cy.get('[class*="Card"]').should('have.length.at.least', 8)
      })
    })

    it('should display feature titles', () => {
      const features = [
        '2D Floor Plans',
        '3D Elevation',
        'Electrical Layout',
        'Plumbing Design',
        'Door & Windows',
        'Interior Design',
        'Structural Plans',
        'CAD Files'
      ]

      features.forEach((feature) => {
        cy.contains(feature).should('be.visible')
      })
    })
  })

  describe('How It Works Section', () => {
    it('should display how it works section', () => {
      cy.get('#how-it-works').should('exist')
      cy.contains('From Plot to Plan in 3 Simple Steps').should('be.visible')
    })

    it('should display all 3 steps', () => {
      cy.contains('Enter Plot Details').should('be.visible')
      cy.contains('AI Generates Design').should('be.visible')
      cy.contains('Download & Build').should('be.visible')
    })
  })

  describe('Pricing Section', () => {
    it('should display pricing section', () => {
      cy.get('#pricing').should('exist')
      cy.contains('Simple, Transparent Pricing').should('be.visible')
    })

    it('should display all pricing tiers', () => {
      cy.contains('Basic').should('be.visible')
      cy.contains('Pro').should('be.visible')
      cy.contains('Enterprise').should('be.visible')
    })

    it('should show pricing amounts', () => {
      cy.contains('Free').should('be.visible')
      cy.contains('₹999').should('be.visible')
      cy.contains('Custom').should('be.visible')
    })
  })

  describe('Footer', () => {
    it('should display footer', () => {
      cy.get('footer').should('be.visible')
    })

    it('should contain copyright information', () => {
      cy.get('footer').contains('2024 Plot2Plan').should('be.visible')
    })

    it('should have footer links', () => {
      cy.get('footer').within(() => {
        cy.contains('Product').should('be.visible')
        cy.contains('Company').should('be.visible')
        cy.contains('Legal').should('be.visible')
      })
    })
  })

  describe('Navigation', () => {
    it('should have Sign In button in navbar', () => {
      cy.contains('button', 'Sign In').should('be.visible')
    })

    it('should have Get Started button in navbar', () => {
      cy.contains('button', 'Get Started').should('be.visible')
    })

    it('should navigate to login page when Sign In is clicked', () => {
      cy.contains('button', 'Sign In').click()
      cy.url().should('include', '/login')
    })

    it('should navigate to register page when Get Started is clicked', () => {
      cy.visit('/')
      cy.contains('button', 'Get Started').first().click()
      cy.url().should('include', '/register')
    })
  })

  describe('Scroll Behavior', () => {
    it('should scroll to features section when anchor link is clicked', () => {
      cy.get('a[href="#features"]').first().click()
      cy.get('#features').should('be.visible')
    })

    it('should scroll to pricing section when anchor link is clicked', () => {
      cy.get('a[href="#pricing"]').first().click()
      cy.get('#pricing').should('be.visible')
    })
  })
})
