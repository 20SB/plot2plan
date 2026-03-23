import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Section } from '@/components/ui/Section';
import { OrganizationSchema, SoftwareAppSchema, FAQSchema } from '@/components/StructuredData';

export default function Home() {
  return (
    <>
      {/* Structured Data for SEO */}
      <OrganizationSchema />
      <SoftwareAppSchema />
      <FAQSchema />
      
      <div className="min-h-screen">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-secondary-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">P2P</span>
              </div>
              <span className="text-xl font-heading font-bold text-gray-900">Plot2Plan</span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-primary-600 transition-colors">Features</a>
              <a href="#how-it-works" className="text-gray-600 hover:text-primary-600 transition-colors">How It Works</a>
              <a href="#pricing" className="text-gray-600 hover:text-primary-600 transition-colors">Pricing</a>
            </div>
            
            <div className="flex items-center space-x-3">
              <Link href="/login">
                <Button variant="ghost" size="sm">Sign In</Button>
              </Link>
              <Link href="/register">
                <Button variant="accent" size="sm">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <Section background="gradient" spacing="xl" className="pt-32">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="font-heading font-bold text-white mb-6 leading-tight">
            Turn Your Plot into a Perfect Home
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto">
            AI-powered 2D floor plans, 3D elevations & complete house design in minutes. 
            No architect needed.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button variant="accent" size="xl" className="shadow-2xl hover:scale-105 transform transition-all">
                Create Your Plan Free →
              </Button>
            </Link>
            <Link href="#how-it-works">
              <Button variant="outline" size="xl" className="bg-white/10 border-white text-white hover:bg-white/20">
                See How It Works
              </Button>
            </Link>
          </div>
          
          {/* Trust Badges */}
          <div className="mt-12 flex flex-wrap justify-center items-center gap-8 text-white/80 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-2xl">⚡</span>
              <span>5 min design</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🏗️</span>
              <span>Construction-ready</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🇮🇳</span>
              <span>Vastu compliant</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">💰</span>
              <span>Save ₹50,000+</span>
            </div>
          </div>
        </div>
      </Section>

      {/* Features Section */}
      <Section id="features" background="gray" spacing="xl">
        <div className="text-center mb-16">
          <h2 className="font-heading font-bold text-gray-900 mb-4">
            Everything You Need to Build Your Dream Home
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Professional architectural drawings that architects charge lakhs for, now powered by AI.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            {
              icon: '📐',
              title: '2D Floor Plans',
              description: 'Detailed naksha with accurate measurements, room layouts, and dimensions'
            },
            {
              icon: '🏠',
              title: '3D Elevation',
              description: 'Stunning 3D renders showing exactly how your home will look'
            },
            {
              icon: '⚡',
              title: 'Electrical Layout',
              description: 'Complete wiring plans, switch locations, and outlet placements'
            },
            {
              icon: '🚰',
              title: 'Plumbing Design',
              description: 'Water supply, drainage, and bathroom fixture layouts'
            },
            {
              icon: '🪟',
              title: 'Door & Windows',
              description: 'Detailed working drawings for all openings with specifications'
            },
            {
              icon: '🎨',
              title: 'Interior Design',
              description: 'Room-wise interior suggestions with furniture placement'
            },
            {
              icon: '🏗️',
              title: 'Structural Plans',
              description: 'Basic structural design for foundation and load-bearing walls'
            },
            {
              icon: '📄',
              title: 'CAD Files',
              description: 'Download in PDF, DXF formats for contractors and authorities'
            }
          ].map((feature, idx) => (
            <Card key={idx} hover className="text-center">
              <div className="text-5xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-heading font-semibold mb-2 text-gray-900">
                {feature.title}
              </h3>
              <p className="text-gray-600">
                {feature.description}
              </p>
            </Card>
          ))}
        </div>
      </Section>

      {/* How It Works Section */}
      <Section id="how-it-works" background="white" spacing="xl">
        <div className="text-center mb-16">
          <h2 className="font-heading font-bold text-gray-900 mb-4">
            From Plot to Plan in 3 Simple Steps
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            No technical knowledge required. Just answer a few questions.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-12">
          {[
            {
              step: '01',
              title: 'Enter Plot Details',
              description: 'Tell us your plot size, facing direction, number of rooms, and preferences like Vastu compliance'
            },
            {
              step: '02',
              title: 'AI Generates Design',
              description: 'Our AI creates optimized layouts considering Indian building codes, Vastu, and best practices'
            },
            {
              step: '03',
              title: 'Download & Build',
              description: 'Get all drawings in PDF/DXF format. Ready to submit to authorities and share with contractors'
            }
          ].map((item, idx) => (
            <div key={idx} className="relative">
              <div className="text-6xl font-heading font-bold text-primary-100 mb-4">
                {item.step}
              </div>
              <h3 className="text-2xl font-heading font-semibold mb-3 text-gray-900">
                {item.title}
              </h3>
              <p className="text-gray-600 text-lg">
                {item.description}
              </p>
              {idx < 2 && (
                <div className="hidden md:block absolute top-12 -right-6 text-4xl text-primary-300">
                  →
                </div>
              )}
            </div>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <Link href="/register">
            <Button variant="primary" size="lg">
              Start Designing Now →
            </Button>
          </Link>
        </div>
      </Section>

      {/* Preview Section */}
      <Section background="gray" spacing="xl">
        <div className="text-center mb-16">
          <h2 className="font-heading font-bold text-gray-900 mb-4">
            See What You'll Get
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Professional-grade designs that architects charge ₹50,000+ for
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {[
            { title: '2D Floor Plan', desc: 'Complete naksha with dimensions' },
            { title: '3D Elevation', desc: 'Realistic exterior view' },
            { title: 'Electrical Layout', desc: 'Wiring & switch locations' },
            { title: 'Plumbing Design', desc: 'Water supply & drainage' }
          ].map((item, idx) => (
            <Card key={idx} padding="none" className="overflow-hidden group">
              <div className="h-64 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-600/20 to-secondary-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="text-6xl opacity-20 group-hover:opacity-30 transition-opacity">
                  {['📐', '🏠', '⚡', '🚰'][idx]}
                </span>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-gray-400 font-medium">Sample Coming Soon</span>
                </div>
              </div>
              <div className="p-6">
                <h4 className="font-heading font-semibold text-lg mb-1 text-gray-900">
                  {item.title}
                </h4>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            </Card>
          ))}
        </div>
      </Section>

      {/* Pricing Section */}
      <Section id="pricing" background="white" spacing="xl">
        <div className="text-center mb-16">
          <h2 className="font-heading font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Pay once, own forever. No subscriptions, no hidden fees.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {[
            {
              name: 'Basic',
              price: 'Free',
              description: 'Perfect for exploring',
              features: [
                '1 project',
                '2D floor plan',
                'Basic measurements',
                'PDF download'
              ]
            },
            {
              name: 'Pro',
              price: '₹999',
              description: 'Most popular',
              features: [
                'Unlimited projects',
                '2D + 3D designs',
                'All drawing types',
                'PDF + DXF export',
                'Vastu compliance',
                'Priority support'
              ],
              popular: true
            },
            {
              name: 'Enterprise',
              price: 'Custom',
              description: 'For professionals',
              features: [
                'Everything in Pro',
                'Bulk projects',
                'Custom branding',
                'API access',
                'Dedicated support'
              ]
            }
          ].map((plan, idx) => (
            <Card 
              key={idx} 
              variant={plan.popular ? 'elevated' : 'default'}
              className={plan.popular ? 'border-2 border-accent-500 relative' : ''}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-accent-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}
              <div className="text-center">
                <h3 className="text-2xl font-heading font-bold mb-2 text-gray-900">
                  {plan.name}
                </h3>
                <p className="text-gray-600 mb-4">{plan.description}</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  {plan.price !== 'Free' && plan.price !== 'Custom' && (
                    <span className="text-gray-600">/one-time</span>
                  )}
                </div>
                <Button 
                  variant={plan.popular ? 'accent' : 'outline'} 
                  size="md" 
                  fullWidth
                >
                  {plan.price === 'Free' ? 'Get Started' : plan.price === 'Custom' ? 'Contact Us' : 'Buy Now'}
                </Button>
              </div>
              <div className="mt-8 space-y-3">
                {plan.features.map((feature, fidx) => (
                  <div key={fidx} className="flex items-center gap-3">
                    <span className="text-secondary-500 text-xl">✓</span>
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </Section>

      {/* CTA Section */}
      <Section background="gradient" spacing="lg">
        <div className="text-center">
          <h2 className="font-heading font-bold text-white mb-6">
            Ready to Design Your Dream Home?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of homeowners who saved time and money with Plot2Plan
          </p>
          <Link href="/register">
            <Button variant="accent" size="xl" className="shadow-2xl">
              Start Free Today →
            </Button>
          </Link>
          <p className="text-white/70 mt-4">No credit card required</p>
        </div>
      </Section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-secondary-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">P2P</span>
                </div>
                <span className="text-white font-heading font-bold text-lg">Plot2Plan</span>
              </div>
              <p className="text-sm">
                AI-powered house design platform for Indian homes.
              </p>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Examples</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; 2024 Plot2Plan. All rights reserved. Made with ❤️ for Indian homeowners.</p>
          </div>
        </div>
      </footer>
    </div>
    </>
  );
}
