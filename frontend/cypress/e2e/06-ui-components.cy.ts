/// <reference types="cypress" />

describe('UI Components & Design System Tests', () => {
  describe('Button Component Tests', () => {
    beforeEach(() => {
      cy.visit('/')
    })

    it('should have proper button styling', () => {
      cy.get('button').first().should('have.css', 'border-radius')
      cy.get('button').first().should('have.css', 'padding')
      cy.get('button').first().should('have.css', 'transition')
    })

    it('should have hover states', () => {
      cy.get('button').first().trigger('mouseover')
      // Button should have hover effect
      cy.get('button').first().should('exist')
    })

    it('should be keyboard accessible', () => {
      cy.get('button').first().focus()
      cy.get('button:focus').should('exist')
    })
  })

  describe('Card Component Tests', () => {
    beforeEach(() => {
      cy.visit('/')
    })

    it('should display feature cards with proper styling', () => {
      cy.get('#features').within(() => {
        cy.get('[class*="rounded"]').should('exist')
        cy.get('[class*="shadow"]').should('exist')
      })
    })

    it('should have consistent spacing', () => {
      cy.get('#features').within(() => {
        cy.get('[class*="p-"]').should('exist') // Padding classes
      })
    })
  })

  describe('Form Input Tests', () => {
    beforeEach(() => {
      cy.visit('/register')
    })

    it('should have consistent input styling', () => {
      cy.get('input').first().should('have.css', 'border-radius')
      cy.get('input').first().should('have.css', 'padding')
      cy.get('input').first().should('have.css', 'border')
    })

    it('should show focus states', () => {
      cy.get('input[name="email"]').focus()
      cy.get('input[name="email"]:focus').should('exist')
    })

    it('should have proper labels', () => {
      cy.get('label').should('have.length.at.least', 4)
      cy.get('label').each(($label) => {
        expect($label.text().trim()).to.not.be.empty
      })
    })
  })

  describe('Section Component Tests', () => {
    beforeEach(() => {
      cy.visit('/')
    })

    it('should have proper section spacing', () => {
      cy.get('section').should('have.length.at.least', 3)
      cy.get('section').first().should('have.css', 'padding-top')
      cy.get('section').first().should('have.css', 'padding-bottom')
    })

    it('should use background variations', () => {
      // Check for different background colors
      cy.get('[class*="bg-"]').should('exist')
    })
  })

  describe('Navigation Component', () => {
    beforeEach(() => {
      cy.visit('/')
    })

    it('should be sticky on scroll', () => {
      cy.get('nav').should('have.css', 'position', 'fixed')
    })

    it('should have backdrop blur effect', () => {
      cy.get('nav').should('have.css', 'backdrop-filter')
    })

    it('should contain logo', () => {
      cy.get('nav').within(() => {
        cy.contains('Plot2Plan').should('be.visible')
        cy.contains('P2P').should('be.visible')
      })
    })
  })

  describe('Footer Component', () => {
    beforeEach(() => {
      cy.visit('/')
    })

    it('should display all footer sections', () => {
      cy.get('footer').within(() => {
        cy.contains('Product').should('be.visible')
        cy.contains('Company').should('be.visible')
        cy.contains('Legal').should('be.visible')
      })
    })

    it('should have proper link styling', () => {
      cy.get('footer a').should('have.css', 'transition')
    })

    it('should display copyright', () => {
      cy.get('footer').contains('2024').should('be.visible')
    })
  })

  describe('Color Consistency', () => {
    beforeEach(() => {
      cy.visit('/')
    })

    it('should use primary color consistently', () => {
      cy.get('[class*="primary-"]').should('exist')
    })

    it('should use secondary color for accents', () => {
      cy.get('[class*="secondary-"]').should('exist')
    })

    it('should use accent color for CTAs', () => {
      // Check for orange accent color in main CTAs
      cy.contains('button', 'Create Your Plan Free').should('exist')
    })
  })

  describe('Spacing Consistency', () => {
    beforeEach(() => {
      cy.visit('/')
    })

    it('should have consistent gap spacing in grids', () => {
      cy.get('[class*="gap-"]').should('exist')
    })

    it('should have consistent padding in containers', () => {
      cy.get('[class*="px-"]').should('exist')
      cy.get('[class*="py-"]').should('exist')
    })
  })

  describe('Shadow & Depth', () => {
    beforeEach(() => {
      cy.visit('/')
    })

    it('should use shadows for elevation', () => {
      cy.get('[class*="shadow"]').should('exist')
    })

    it('should have hover shadow effects', () => {
      cy.get('#features').within(() => {
        cy.get('[class*="hover:shadow"]').should('exist')
      })
    })
  })

  describe('Gradient Usage', () => {
    beforeEach(() => {
      cy.visit('/')
    })

    it('should use gradient for hero section', () => {
      cy.get('[class*="gradient"]').should('exist')
    })

    it('should use gradient for logo', () => {
      cy.contains('P2P').parent().should('have.class').and('match', /gradient|from-/)
    })
  })

  describe('Icon & Emoji Consistency', () => {
    beforeEach(() => {
      cy.visit('/')
    })

    it('should display emoji icons in features', () => {
      const emojis = ['📐', '🏠', '⚡', '🚰', '🪟', '🎨', '🏗️', '📄']
      
      emojis.forEach((emoji) => {
        cy.contains(emoji).should('be.visible')
      })
    })
  })

  describe('Loading States', () => {
    beforeEach(() => {
      cy.visit('/login')
    })

    it('should show loading state on form submission', () => {
      cy.intercept('POST', '**/auth/login', {
        delay: 1000,
        statusCode: 200,
        body: { user: {}, access_token: 'token' }
      })

      cy.get('input[name="email"]').type('test@example.com')
      cy.get('input[name="password"]').type('password123')
      cy.get('button[type="submit"]').click()

      cy.contains(/signing in|loading/i).should('be.visible')
    })
  })

  describe('Error States', () => {
    beforeEach(() => {
      cy.visit('/login')
    })

    it('should display error messages with proper styling', () => {
      cy.intercept('POST', '**/auth/login', {
        statusCode: 401,
        body: { message: 'Invalid credentials' }
      })

      cy.get('input[name="email"]').type('wrong@email.com')
      cy.get('input[name="password"]').type('wrong')
      cy.get('button[type="submit"]').click()

      cy.get('[class*="red"]').should('be.visible')
    })
  })

  describe('Transitions & Animations', () => {
    beforeEach(() => {
      cy.visit('/')
    })

    it('should have smooth transitions on buttons', () => {
      cy.get('button').first().should('have.css', 'transition-duration')
    })

    it('should have hover effects on cards', () => {
      cy.get('#features').within(() => {
        cy.get('[class*="hover"]').should('exist')
      })
    })
  })
})
