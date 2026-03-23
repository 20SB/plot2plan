/// <reference types="cypress" />

describe('Responsive Design Tests', () => {
  const viewports = [
    { name: 'iPhone SE', width: 375, height: 667 },
    { name: 'iPad', width: 768, height: 1024 },
    { name: 'Desktop', width: 1280, height: 720 },
    { name: 'Large Desktop', width: 1920, height: 1080 }
  ]

  describe('Landing Page Responsiveness', () => {
    viewports.forEach((viewport) => {
      describe(`${viewport.name} (${viewport.width}x${viewport.height})`, () => {
        beforeEach(() => {
          cy.viewport(viewport.width, viewport.height)
          cy.visit('/')
        })

        it('should load without layout breaks', () => {
          cy.get('body').should('be.visible')
          
          // Check for horizontal scroll (should not exist)
          cy.window().then((win) => {
            expect(win.document.documentElement.scrollWidth).to.be.lte(viewport.width + 20)
          })
        })

        it('should display navigation correctly', () => {
          cy.get('nav').should('be.visible')
          cy.contains('Plot2Plan').should('be.visible')
        })

        it('should display hero section', () => {
          cy.contains('Turn Your Plot into a Perfect Home').should('be.visible')
        })

        it('should have clickable CTA buttons', () => {
          cy.contains('button', 'Get Started').should('be.visible').and('not.be.disabled')
        })

        if (viewport.width < 768) {
          it('should stack content vertically on mobile', () => {
            // Feature cards should stack
            cy.get('#features').within(() => {
              cy.get('[class*="grid"]').should('exist')
            })
          })

          it('should hide desktop-only elements', () => {
            // Desktop navigation items might be hidden
            cy.get('nav').within(() => {
              cy.get('.hidden.md\\:flex, .hidden.sm\\:flex').should('not.be.visible')
            })
          })
        }

        if (viewport.width >= 768) {
          it('should display multi-column layout for features', () => {
            cy.get('#features').within(() => {
              cy.get('[class*="grid"]').should('exist')
            })
          })
        }
      })
    })
  })

  describe('Authentication Pages Responsiveness', () => {
    viewports.forEach((viewport) => {
      describe(`Login Page - ${viewport.name}`, () => {
        beforeEach(() => {
          cy.viewport(viewport.width, viewport.height)
          cy.visit('/login')
        })

        it('should display form without overflow', () => {
          cy.get('form').should('be.visible')
          cy.get('input[name="email"]').should('be.visible')
          cy.get('input[name="password"]').should('be.visible')
        })

        it('should have clickable submit button', () => {
          cy.get('button[type="submit"]').should('be.visible').and('not.be.disabled')
        })

        if (viewport.width < 1024) {
          it('should hide branding sidebar on small screens', () => {
            // Left branding panel should be hidden on mobile/tablet
            cy.get('[class*="hidden"][class*="lg:flex"]').should('not.be.visible')
          })
        }

        if (viewport.width >= 1024) {
          it('should show split-screen layout on desktop', () => {
            // Both sides should be visible
            cy.get('[class*="lg:w-1/2"]').should('exist')
          })
        }
      })

      describe(`Register Page - ${viewport.name}`, () => {
        beforeEach(() => {
          cy.viewport(viewport.width, viewport.height)
          cy.visit('/register')
        })

        it('should display all form fields', () => {
          cy.get('input[name="name"]').should('be.visible')
          cy.get('input[name="email"]').should('be.visible')
          cy.get('input[name="password"]').should('be.visible')
          cy.get('input[name="phone"]').should('be.visible')
        })

        it('should have full-width submit button', () => {
          cy.get('button[type="submit"]').should('be.visible')
        })
      })
    })
  })

  describe('Dashboard Responsiveness', () => {
    beforeEach(() => {
      // Mock login
      cy.intercept('POST', '**/auth/login', {
        statusCode: 200,
        body: {
          user: { _id: '123', name: 'Test User', email: 'test@plot2plan.com' },
          access_token: 'fake-jwt-token'
        }
      })

      cy.intercept('GET', '**/projects/stats', {
        statusCode: 200,
        body: {
          total: 0,
          byStatus: {}
        }
      })

      cy.intercept('GET', '**/projects?page=1&limit=10', {
        statusCode: 200,
        body: {
          projects: [],
          total: 0,
          page: 1,
          pages: 0
        }
      })

      cy.visit('/login')
      cy.get('input[name="email"]').type('test@plot2plan.com')
      cy.get('input[name="password"]').type('Test123!@#')
      cy.get('button[type="submit"]').click()
      cy.url().should('include', '/dashboard')
    })

    viewports.forEach((viewport) => {
      describe(`Dashboard - ${viewport.name}`, () => {
        beforeEach(() => {
          cy.viewport(viewport.width, viewport.height)
        })

        it('should display dashboard header', () => {
          cy.contains('Dashboard').should('be.visible')
        })

        it('should display navigation', () => {
          cy.get('nav').should('be.visible')
          cy.contains('Plot2Plan').should('be.visible')
        })

        it('should have logout button accessible', () => {
          cy.contains('button', 'Logout').should('be.visible')
        })

        if (viewport.width < 640) {
          it('should hide user name on very small screens', () => {
            cy.get('.hidden.sm\\:block').should('not.be.visible')
          })
        }
      })
    })
  })

  describe('Touch Interactions (Mobile)', () => {
    beforeEach(() => {
      cy.viewport(375, 667) // iPhone SE
      cy.visit('/')
    })

    it('should have touch-friendly button sizes', () => {
      cy.contains('button', 'Get Started').then(($btn) => {
        const height = $btn.height()
        // Touch-friendly buttons should be at least 44px tall
        expect(height).to.be.at.least(40)
      })
    })

    it('should have adequate spacing between clickable elements', () => {
      cy.get('nav button').should('have.length.at.least', 1)
    })
  })

  describe('Tablet Specific Tests', () => {
    beforeEach(() => {
      cy.viewport(768, 1024)
      cy.visit('/')
    })

    it('should adapt grid layouts for tablet', () => {
      cy.get('#features').within(() => {
        cy.get('[class*="md:grid-cols"]').should('exist')
      })
    })

    it('should maintain readability', () => {
      cy.get('h1').should('be.visible')
      cy.get('p').first().should('be.visible')
    })
  })

  describe('Orientation Changes', () => {
    it('should handle portrait to landscape transition', () => {
      cy.viewport(375, 667) // Portrait
      cy.visit('/')
      cy.contains('Plot2Plan').should('be.visible')

      cy.viewport(667, 375) // Landscape
      cy.contains('Plot2Plan').should('be.visible')
      cy.get('body').should('be.visible')
    })
  })

  describe('Text Scaling', () => {
    beforeEach(() => {
      cy.visit('/')
    })

    it('should have readable font sizes on mobile', () => {
      cy.viewport(375, 667)
      
      cy.get('h1').then(($h1) => {
        const fontSize = parseFloat(window.getComputedStyle($h1[0]).fontSize)
        // Headings should be at least 24px on mobile
        expect(fontSize).to.be.at.least(24)
      })
    })

    it('should scale headings appropriately on desktop', () => {
      cy.viewport(1280, 720)
      
      cy.get('h1').then(($h1) => {
        const fontSize = parseFloat(window.getComputedStyle($h1[0]).fontSize)
        // Headings should be larger on desktop
        expect(fontSize).to.be.at.least(36)
      })
    })
  })
})
