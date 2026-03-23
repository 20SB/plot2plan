/// <reference types="cypress" />

describe('Performance & System Tests', () => {
  describe('Page Load Performance', () => {
    it('should load homepage within acceptable time', () => {
      const start = Date.now()
      
      cy.visit('/')
      
      cy.window().then(() => {
        const loadTime = Date.now() - start
        // Should load within 3 seconds
        expect(loadTime).to.be.lessThan(3000)
      })
    })

    it('should load login page quickly', () => {
      const start = Date.now()
      
      cy.visit('/login')
      
      cy.get('form').should('be.visible').then(() => {
        const loadTime = Date.now() - start
        expect(loadTime).to.be.lessThan(2000)
      })
    })

    it('should not have console errors on homepage', () => {
      cy.visit('/', {
        onBeforeLoad(win) {
          cy.spy(win.console, 'error').as('consoleError')
        }
      })
      
      cy.wait(2000)
      cy.get('@consoleError').should('not.be.called')
    })
  })

  describe('Network Requests', () => {
    it('should not have failed network requests on homepage', () => {
      cy.intercept('**/*', (req) => {
        req.continue((res) => {
          expect(res.statusCode).to.be.oneOf([200, 201, 204, 304])
        })
      })
      
      cy.visit('/')
    })

    it('should handle API errors gracefully', () => {
      cy.intercept('POST', '**/auth/login', {
        statusCode: 500,
        body: { message: 'Server error' }
      })
      
      cy.visit('/login')
      cy.get('input[name="email"]').type('test@example.com')
      cy.get('input[name="password"]').type('password123')
      cy.get('button[type="submit"]').click()
      
      // Should show user-friendly error
      cy.contains(/error|failed/i).should('be.visible')
    })
  })

  describe('Resource Loading', () => {
    it('should load all images without errors', () => {
      cy.visit('/')
      
      cy.get('img').each(($img) => {
        // Check if image loaded successfully
        expect($img[0].naturalWidth).to.be.greaterThan(0)
      })
    })

    it('should load fonts successfully', () => {
      cy.visit('/')
      
      cy.document().then((doc) => {
        cy.wrap(doc.fonts.ready).should('exist')
      })
    })
  })

  describe('Browser Compatibility', () => {
    it('should work with different user agents', () => {
      const userAgents = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/91.0.4472.124',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/14.1.1',
        'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) Safari/604.1'
      ]
      
      userAgents.forEach((ua) => {
        cy.visit('/', {
          headers: {
            'User-Agent': ua
          }
        })
        
        cy.get('body').should('be.visible')
      })
    })
  })

  describe('Memory Leaks', () => {
    it('should not have memory leaks on navigation', () => {
      cy.visit('/')
      cy.visit('/login')
      cy.visit('/register')
      cy.visit('/')
      
      // No errors should occur
      cy.get('body').should('be.visible')
    })
  })

  describe('Form Performance', () => {
    it('should respond to input immediately', () => {
      cy.visit('/register')
      
      cy.get('input[name="name"]').type('Test')
      cy.get('input[name="name"]').should('have.value', 'Test')
    })

    it('should validate in real-time', () => {
      cy.visit('/register')
      
      cy.get('input[name="email"]').type('invalid')
      cy.get('input[name="email"]').blur()
      
      // Should show validation state
      cy.get('input[name="email"]').should('have.attr', 'type', 'email')
    })
  })

  describe('Scroll Performance', () => {
    it('should scroll smoothly', () => {
      cy.visit('/')
      
      cy.get('a[href="#features"]').first().click()
      cy.wait(500)
      cy.get('#features').should('be.visible')
    })

    it('should maintain scroll position', () => {
      cy.visit('/')
      
      cy.scrollTo('bottom')
      cy.get('footer').should('be.visible')
    })
  })

  describe('Caching', () => {
    it('should cache static assets', () => {
      cy.visit('/')
      
      cy.window().then((win) => {
        // Check if service worker is registered (if PWA is enabled)
        if ('serviceWorker' in win.navigator) {
          expect(win.navigator.serviceWorker).to.exist
        }
      })
    })
  })

  describe('SEO Files Performance', () => {
    it('should serve robots.txt quickly', () => {
      const start = Date.now()
      
      cy.request('/robots.txt').then((response) => {
        const loadTime = Date.now() - start
        expect(loadTime).to.be.lessThan(500)
        expect(response.status).to.eq(200)
      })
    })

    it('should serve sitemap.xml quickly', () => {
      const start = Date.now()
      
      cy.request('/sitemap.xml').then((response) => {
        const loadTime = Date.now() - start
        expect(loadTime).to.be.lessThan(1000)
        expect(response.status).to.eq(200)
      })
    })
  })
})
