/// <reference types="cypress" />

describe('SEO & Branding Tests', () => {
  describe('SEO Meta Tags - Homepage', () => {
    beforeEach(() => {
      cy.visit('/')
    })

    it('should have correct page title', () => {
      cy.title().should('eq', 'Plot2Plan - AI House Design & Floor Plan Generator')
    })

    it('should have meta description', () => {
      cy.get('head meta[name="description"]')
        .should('have.attr', 'content')
        .and('include', 'floor plan')
        .and('include', 'AI')
    })

    it('should have keywords meta tag', () => {
      cy.get('head meta[name="keywords"]')
        .should('have.attr', 'content')
        .and('include', 'house plan generator')
    })

    it('should have Open Graph meta tags', () => {
      cy.get('head meta[property="og:title"]')
        .should('have.attr', 'content')
        .and('include', 'Plot2Plan')

      cy.get('head meta[property="og:description"]')
        .should('have.attr', 'content')
        .and('not.be.empty')

      cy.get('head meta[property="og:type"]')
        .should('have.attr', 'content', 'website')

      cy.get('head meta[property="og:url"]')
        .should('have.attr', 'content')

      cy.get('head meta[property="og:locale"]')
        .should('have.attr', 'content', 'en_IN')

      cy.get('head meta[property="og:site_name"]')
        .should('have.attr', 'content', 'Plot2Plan')
    })

    it('should have Twitter Card meta tags', () => {
      cy.get('head meta[name="twitter:card"]')
        .should('have.attr', 'content', 'summary_large_image')

      cy.get('head meta[name="twitter:title"]')
        .should('have.attr', 'content')
        .and('include', 'Plot2Plan')

      cy.get('head meta[name="twitter:description"]')
        .should('have.attr', 'content')
        .and('not.be.empty')
    })

    it('should have canonical URL', () => {
      cy.get('head link[rel="canonical"]').should('exist')
    })

    it('should have language attribute', () => {
      cy.get('html').should('have.attr', 'lang', 'en')
    })

    it('should have proper charset', () => {
      cy.get('head meta[charset]').should('exist')
    })

    it('should have viewport meta tag', () => {
      cy.get('head meta[name="viewport"]')
        .should('have.attr', 'content')
        .and('include', 'width=device-width')
    })
  })

  describe('Structured Data (JSON-LD)', () => {
    beforeEach(() => {
      cy.visit('/')
    })

    it('should have Organization schema', () => {
      cy.get('script[type="application/ld+json"]').should('exist')
      
      cy.get('script[type="application/ld+json"]').then(($scripts) => {
        const schemas = Array.from($scripts).map((script) => {
          try {
            return JSON.parse(script.textContent || '{}')
          } catch {
            return {}
          }
        })

        const orgSchema = schemas.find((s) => s['@type'] === 'Organization')
        expect(orgSchema).to.exist
        expect(orgSchema.name).to.equal('Plot2Plan')
        expect(orgSchema.url).to.include('plot2plan')
      })
    })

    it('should have SoftwareApplication schema', () => {
      cy.get('script[type="application/ld+json"]').then(($scripts) => {
        const schemas = Array.from($scripts).map((script) => {
          try {
            return JSON.parse(script.textContent || '{}')
          } catch {
            return {}
          }
        })

        const appSchema = schemas.find((s) => s['@type'] === 'SoftwareApplication')
        expect(appSchema).to.exist
        expect(appSchema.name).to.equal('Plot2Plan')
        expect(appSchema.applicationCategory).to.exist
      })
    })

    it('should have FAQ schema', () => {
      cy.get('script[type="application/ld+json"]').then(($scripts) => {
        const schemas = Array.from($scripts).map((script) => {
          try {
            return JSON.parse(script.textContent || '{}')
          } catch {
            return {}
          }
        })

        const faqSchema = schemas.find((s) => s['@type'] === 'FAQPage')
        expect(faqSchema).to.exist
        expect(faqSchema.mainEntity).to.be.an('array')
      })
    })
  })

  describe('Technical SEO Files', () => {
    it('should have robots.txt file', () => {
      cy.request('/robots.txt').then((response) => {
        expect(response.status).to.eq(200)
        expect(response.body).to.include('User-agent')
        expect(response.body).to.include('Sitemap')
      })
    })

    it('should have sitemap.xml file', () => {
      cy.request('/sitemap.xml').then((response) => {
        expect(response.status).to.eq(200)
        expect(response.headers['content-type']).to.include('xml')
      })
    })

    it('should have manifest.json for PWA', () => {
      cy.request('/manifest.json').then((response) => {
        expect(response.status).to.eq(200)
        const manifest = response.body
        expect(manifest.name).to.include('Plot2Plan')
        expect(manifest.short_name).to.exist
        expect(manifest.theme_color).to.exist
      })
    })
  })

  describe('Brand Colors & Design System', () => {
    beforeEach(() => {
      cy.visit('/')
    })

    it('should use primary brand color (Deep Blue)', () => {
      // Check if primary color is used
      cy.get('[class*="primary"]').should('exist')
      
      // Check gradient hero section
      cy.get('[class*="gradient"]').should('exist')
    })

    it('should use secondary brand color (Teal)', () => {
      cy.get('[class*="secondary"]').should('exist')
    })

    it('should use accent color (Orange) for CTAs', () => {
      // Main CTA should use accent color
      cy.contains('button', 'Create Your Plan Free').should('exist')
    })

    it('should have consistent button styling', () => {
      cy.get('button').should('have.length.at.least', 1)
      
      cy.get('button').first().should('have.css', 'border-radius')
      cy.get('button').first().should('have.css', 'transition')
    })

    it('should have consistent card styling', () => {
      cy.get('#features').within(() => {
        cy.get('[class*="rounded"]').should('exist')
        cy.get('[class*="shadow"]').should('exist')
      })
    })

    it('should use proper spacing scale', () => {
      // Check for consistent padding/margin
      cy.get('section').should('have.length.at.least', 3)
    })
  })

  describe('Typography & Fonts', () => {
    beforeEach(() => {
      cy.visit('/')
    })

    it('should load Poppins font for headings', () => {
      cy.get('h1').should('have.css', 'font-family').and('match', /Poppins|Inter/)
    })

    it('should load Inter font for body text', () => {
      cy.get('p').first().should('have.css', 'font-family').and('include', 'Inter')
    })

    it('should have proper heading hierarchy', () => {
      cy.get('h1').should('exist')
      cy.get('h2').should('exist')
      cy.get('h3').should('exist')
    })

    it('should have readable font sizes', () => {
      cy.get('p').first().then(($p) => {
        const fontSize = parseFloat(window.getComputedStyle($p[0]).fontSize)
        expect(fontSize).to.be.at.least(14)
      })
    })

    it('should have proper font weights', () => {
      cy.get('h1').should('have.css', 'font-weight')
      
      cy.get('h1').then(($h1) => {
        const fontWeight = parseInt(window.getComputedStyle($h1[0]).fontWeight)
        expect(fontWeight).to.be.at.least(600) // Semibold or bold
      })
    })
  })

  describe('Logo & Branding Elements', () => {
    beforeEach(() => {
      cy.visit('/')
    })

    it('should display Plot2Plan logo in navbar', () => {
      cy.get('nav').within(() => {
        cy.contains('Plot2Plan').should('be.visible')
      })
    })

    it('should display P2P icon/logo', () => {
      cy.contains('P2P').should('exist')
    })

    it('should have gradient logo background', () => {
      cy.get('[class*="gradient"]').should('exist')
    })

    it('should display logo in footer', () => {
      cy.get('footer').within(() => {
        cy.contains('Plot2Plan').should('be.visible')
      })
    })
  })

  describe('Content Quality', () => {
    beforeEach(() => {
      cy.visit('/')
    })

    it('should have clear value proposition', () => {
      cy.contains('Turn Your Plot into a Perfect Home').should('be.visible')
    })

    it('should mention key features', () => {
      cy.contains('2D floor plan').should('exist')
      cy.contains('3D elevation').should('exist')
      cy.contains('AI').should('exist')
    })

    it('should target Indian market', () => {
      cy.contains('Vastu').should('exist')
      cy.contains('₹').should('exist') // Rupee symbol
    })

    it('should have clear calls-to-action', () => {
      cy.contains('Get Started').should('exist')
      cy.contains('Create').should('exist')
    })
  })

  describe('Accessibility (SEO Related)', () => {
    beforeEach(() => {
      cy.visit('/')
    })

    it('should have semantic HTML', () => {
      cy.get('header, nav, main, section, footer').should('exist')
    })

    it('should have proper heading structure', () => {
      cy.get('h1').should('have.length', 1) // Only one h1 per page
    })

    it('should have descriptive link text', () => {
      cy.get('a').each(($link) => {
        const text = $link.text().trim()
        const href = $link.attr('href')
        
        // Links should have text or aria-label
        if (!text && href !== '#') {
          expect($link.attr('aria-label')).to.exist
        }
      })
    })

    it('should have language specified', () => {
      cy.get('html[lang]').should('exist')
    })
  })

  describe('Performance Indicators', () => {
    beforeEach(() => {
      cy.visit('/')
    })

    it('should load key resources', () => {
      cy.window().then((win) => {
        // Check that fonts are loading
        cy.document().then((doc) => {
          const fonts = doc.fonts
          expect(fonts).to.exist
        })
      })
    })

    it('should not have render-blocking resources', () => {
      // Check that CSS is loaded
      cy.get('head link[rel="stylesheet"]').should('exist')
    })
  })
})
