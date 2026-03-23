/// <reference types="cypress" />

describe('Authentication Flow Tests', () => {
  let testUser: any

  before(() => {
    cy.fixture('users').then((users) => {
      testUser = users.validUser
    })
  })

  describe('Registration Page', () => {
    beforeEach(() => {
      cy.visit('/register')
    })

    it('should load register page successfully', () => {
      cy.url().should('include', '/register')
      cy.contains('Create Account').should('be.visible')
    })

    it('should display Plot2Plan branding', () => {
      // Check for logo
      cy.contains('Plot2Plan').should('be.visible')
      
      // Check for brand colors (gradient background on left side for desktop)
      cy.get('[class*="gradient"]').should('exist')
    })

    it('should show all form fields', () => {
      cy.get('input[name="name"]').should('be.visible')
      cy.get('input[name="email"]').should('be.visible')
      cy.get('input[name="password"]').should('be.visible')
      cy.get('input[name="phone"]').should('be.visible')
    })

    it('should have proper labels', () => {
      cy.contains('label', 'Full Name').should('be.visible')
      cy.contains('label', 'Email Address').should('be.visible')
      cy.contains('label', 'Password').should('be.visible')
      cy.contains('label', 'Phone Number').should('be.visible')
    })

    it('should show link to login page', () => {
      cy.contains('Sign in').should('be.visible').and('have.attr', 'href', '/login')
    })

    it('should validate empty form submission', () => {
      cy.get('button[type="submit"]').click()
      
      // HTML5 validation should prevent submission
      cy.get('input[name="name"]:invalid').should('exist')
    })

    it('should validate email format', () => {
      cy.get('input[name="email"]').type('invalid-email')
      cy.get('button[type="submit"]').click()
      
      cy.get('input[name="email"]:invalid').should('exist')
    })

    it('should validate password minimum length', () => {
      cy.get('input[name="password"]').type('123')
      cy.get('button[type="submit"]').click()
      
      cy.get('input[name="password"]:invalid').should('exist')
    })

    it('should show password helper text', () => {
      cy.contains('Must be at least 6 characters').should('be.visible')
    })

    it('should register new user successfully (mocked)', () => {
      // Intercept the API call
      cy.intercept('POST', '**/auth/register', {
        statusCode: 200,
        body: {
          user: {
            _id: '123',
            name: testUser.name,
            email: testUser.email,
            role: 'user'
          },
          access_token: 'fake-jwt-token'
        }
      }).as('registerRequest')

      // Fill form
      cy.get('input[name="name"]').type(testUser.name)
      cy.get('input[name="email"]').type(`test-${Date.now()}@plot2plan.com`)
      cy.get('input[name="password"]').type(testUser.password)
      cy.get('input[name="phone"]').type(testUser.phone)

      // Submit
      cy.get('button[type="submit"]').click()

      // Wait for API call
      cy.wait('@registerRequest')

      // Should redirect to dashboard
      cy.url().should('include', '/dashboard')
    })

    it('should handle registration error', () => {
      // Intercept with error
      cy.intercept('POST', '**/auth/register', {
        statusCode: 409,
        body: {
          message: 'User with this email already exists'
        }
      }).as('registerError')

      cy.get('input[name="name"]').type(testUser.name)
      cy.get('input[name="email"]').type(testUser.email)
      cy.get('input[name="password"]').type(testUser.password)
      cy.get('button[type="submit"]').click()

      cy.wait('@registerError')

      // Should show error message
      cy.contains('User with this email already exists').should('be.visible')
    })

    it('should disable submit button while loading', () => {
      cy.intercept('POST', '**/auth/register', {
        delay: 1000,
        statusCode: 200,
        body: { user: {}, access_token: 'token' }
      })

      cy.get('input[name="name"]').type(testUser.name)
      cy.get('input[name="email"]').type(`test-${Date.now()}@plot2plan.com`)
      cy.get('input[name="password"]').type(testUser.password)
      
      cy.get('button[type="submit"]').click()
      cy.get('button[type="submit"]').should('be.disabled')
    })
  })

  describe('Login Page', () => {
    beforeEach(() => {
      cy.visit('/login')
    })

    it('should load login page successfully', () => {
      cy.url().should('include', '/login')
      cy.contains('Sign In').should('be.visible')
    })

    it('should display Plot2Plan branding', () => {
      cy.contains('Plot2Plan').should('be.visible')
      cy.get('[class*="gradient"]').should('exist')
    })

    it('should show welcome back message', () => {
      cy.contains('Welcome Back').should('be.visible')
    })

    it('should show all form fields', () => {
      cy.get('input[name="email"]').should('be.visible')
      cy.get('input[name="password"]').should('be.visible')
    })

    it('should have remember me checkbox', () => {
      cy.get('input[type="checkbox"]').should('exist')
      cy.contains('Remember me').should('be.visible')
    })

    it('should have forgot password link', () => {
      cy.contains('Forgot password?').should('be.visible')
    })

    it('should show link to register page', () => {
      cy.contains('Create one free').should('be.visible').and('have.attr', 'href', '/register')
    })

    it('should validate empty form submission', () => {
      cy.get('button[type="submit"]').click()
      cy.get('input[name="email"]:invalid').should('exist')
    })

    it('should login successfully (mocked)', () => {
      cy.intercept('POST', '**/auth/login', {
        statusCode: 200,
        body: {
          user: {
            _id: '123',
            name: 'Test User',
            email: testUser.email,
            role: 'user'
          },
          access_token: 'fake-jwt-token'
        }
      }).as('loginRequest')

      cy.get('input[name="email"]').type(testUser.email)
      cy.get('input[name="password"]').type(testUser.password)
      cy.get('button[type="submit"]').click()

      cy.wait('@loginRequest')
      cy.url().should('include', '/dashboard')
    })

    it('should handle invalid credentials', () => {
      cy.intercept('POST', '**/auth/login', {
        statusCode: 401,
        body: {
          message: 'Invalid credentials'
        }
      }).as('loginError')

      cy.get('input[name="email"]').type('wrong@email.com')
      cy.get('input[name="password"]').type('wrongpassword')
      cy.get('button[type="submit"]').click()

      cy.wait('@loginError')
      cy.contains('Invalid credentials').should('be.visible')
    })

    it('should show loading state on submit', () => {
      cy.intercept('POST', '**/auth/login', {
        delay: 1000,
        statusCode: 200,
        body: { user: {}, access_token: 'token' }
      })

      cy.get('input[name="email"]').type(testUser.email)
      cy.get('input[name="password"]').type(testUser.password)
      cy.get('button[type="submit"]').click()
      
      cy.contains('Signing in...').should('be.visible')
      cy.get('button[type="submit"]').should('be.disabled')
    })
  })

  describe('Protected Routes', () => {
    it('should redirect to login when accessing dashboard without auth', () => {
      cy.visit('/dashboard')
      cy.url().should('include', '/login')
    })

    it('should redirect to login when accessing new project without auth', () => {
      cy.visit('/dashboard/projects/new')
      cy.url().should('include', '/login')
    })
  })

  describe('Logout Flow', () => {
    beforeEach(() => {
      // Mock login first
      cy.intercept('POST', '**/auth/login', {
        statusCode: 200,
        body: {
          user: { _id: '123', name: 'Test User', email: testUser.email },
          access_token: 'fake-jwt-token'
        }
      })

      cy.visit('/login')
      cy.get('input[name="email"]').type(testUser.email)
      cy.get('input[name="password"]').type(testUser.password)
      cy.get('button[type="submit"]').click()
      cy.url().should('include', '/dashboard')
    })

    it('should logout successfully', () => {
      cy.contains('button', 'Logout').click()
      cy.url().should('include', '/login')
    })

    it('should clear user session on logout', () => {
      cy.contains('button', 'Logout').click()
      
      // Try to access protected route
      cy.visit('/dashboard')
      cy.url().should('include', '/login')
    })
  })
})
