# 🎨 Plot2Plan Branding & Design System Guide

Complete brand identity, design system, and style guide for Plot2Plan.

---

## 🎯 Brand Identity

### Name
**Plot2Plan** - Simple, memorable, describes what we do.

### Tagline
"Turn Your Plot into a Perfect Home"

### Mission
Make professional house design accessible to every Indian homeowner through AI.

---

## 🎨 Color Palette

### Primary - Deep Blue (#1E3A8A)
- **Use:** Main brand color, headers, primary CTAs
- **Represents:** Trust, professionalism, engineering precision
- **Tailwind:** `primary-600`

### Secondary - Teal (#14B8A6)
- **Use:** Accents, highlights, supporting elements
- **Represents:** Innovation, freshness, technology
- **Tailwind:** `secondary-500`

### Accent - Orange (#F97316)
- **Use:** Call-to-action buttons, important highlights
- **Represents:** Energy, action, warmth
- **Tailwind:** `accent-500`

### Neutral Colors
- **Light Gray (#F3F4F6):** Backgrounds, subtle sections - `gray-50`
- **Dark Gray (#111827):** Body text, content - `gray-900`
- **White (#FFFFFF):** Cards, primary backgrounds

### Color Usage Guidelines

```css
/* Buttons */
Primary CTA: accent-500 (orange)
Secondary CTA: primary-600 (blue)
Tertiary: secondary-500 (teal)

/* Backgrounds */
Hero sections: gradient-hero (blue to teal)
Alternating sections: white / gray-50
Cards: white with shadow-soft

/* Text */
Headings: gray-900
Body: gray-700
Muted: gray-600
```

---

## 📝 Typography

### Font Families

**Headings:** Poppins (or Inter as fallback)
```css
font-family: var(--font-poppins), Inter, system-ui, sans-serif;
```

**Body:** Inter
```css
font-family: var(--font-inter), system-ui, sans-serif;
```

### Font Sizes

```css
h1: text-4xl md:text-5xl lg:text-6xl (36-60px)
h2: text-3xl md:text-4xl lg:text-5xl (30-48px)
h3: text-2xl md:text-3xl (24-30px)
h4: text-xl md:text-2xl (20-24px)
body: text-base (16px)
small: text-sm (14px)
tiny: text-xs (12px)
```

### Font Weights
- Regular: 400
- Medium: 500
- Semibold: 600
- Bold: 700

---

## 🧩 Design System Components

### Button Component

```tsx
<Button variant="primary" size="lg">
  Click Me
</Button>
```

**Variants:**
- `primary` - Deep blue
- `secondary` - Teal
- `accent` - Orange (main CTA)
- `outline` - Border only
- `ghost` - Transparent

**Sizes:**
- `sm` - Small (px-3 py-1.5)
- `md` - Medium (px-4 py-2)
- `lg` - Large (px-6 py-3)
- `xl` - Extra Large (px-8 py-4)

### Card Component

```tsx
<Card variant="elevated" padding="lg" hover>
  Content here
</Card>
```

**Variants:**
- `default` - Soft shadow
- `bordered` - Border only
- `elevated` - Larger shadow

**Padding:**
- `none`, `sm`, `md`, `lg`, `xl`

### Input Component

```tsx
<Input 
  label="Email" 
  error="Invalid email"
  helperText="We'll never share"
/>
```

### Section Component

```tsx
<Section background="gradient" spacing="xl">
  Content here
</Section>
```

**Backgrounds:**
- `white`, `gray`, `primary`, `gradient`

**Spacing:**
- `sm` (py-12), `md` (py-16), `lg` (py-20), `xl` (py-24)

---

## 🎨 Design Patterns

### Shadows
```css
shadow-soft: subtle soft shadow
shadow-soft-lg: larger soft shadow
```

### Border Radius
- Small elements: `rounded-lg` (8px)
- Cards/Buttons: `rounded-xl` (12px)
- Logo/Icons: `rounded-lg` or `rounded-full`

### Spacing Scale
- Use Tailwind's default spacing: 4, 6, 8, 12, 16, 20, 24
- Sections: 48, 64, 80, 96

### Hover States
- Buttons: slight scale + shadow increase
- Cards: lift with shadow (`hover:-translate-y-1`)
- Links: color change

---

## 🏠 Logo Usage

### Primary Logo
- **Format:** Square icon + text
- **Icon:** "P2P" in white on gradient background
- **Gradient:** primary-600 to secondary-500
- **Rounded:** `rounded-lg`

### Icon Only
Use for favicons, mobile nav, small spaces.

### Spacing
- Minimum clear space: 8px around logo
- Never stretch or distort

---

## 📱 Responsive Design

### Breakpoints (Tailwind defaults)
```
sm: 640px
md: 768px
lg: 1024px
xl: 1280px
2xl: 1536px
```

### Mobile-First Approach
1. Design for mobile first
2. Enhance for larger screens
3. Test on actual devices

### Key Responsive Patterns
```tsx
// Stack on mobile, grid on desktop
grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4

// Hide on mobile, show on desktop
hidden md:block

// Text sizes
text-2xl md:text-3xl lg:text-4xl
```

---

## ✨ UI Principles

### 1. Clarity Over Cleverness
Simple, obvious, straightforward.

### 2. Generous Spacing
Don't cram. Give elements room to breathe.

### 3. Visual Hierarchy
Most important → largest/boldest.

### 4. Consistent Patterns
Same actions = same styles everywhere.

### 5. Feedback
Show loading states, success, errors clearly.

---

## 🎯 Component Usage Examples

### Hero Section
```tsx
<Section background="gradient" spacing="xl" className="pt-32">
  <h1>Main Headline</h1>
  <p className="text-xl">Subtext</p>
  <Button variant="accent" size="xl">CTA</Button>
</Section>
```

### Feature Grid
```tsx
<Section background="gray">
  <div className="grid md:grid-cols-3 gap-8">
    <Card hover>
      <div className="text-5xl mb-4">🎨</div>
      <h3>Feature Title</h3>
      <p>Description</p>
    </Card>
  </div>
</Section>
```

### Form Section
```tsx
<Card>
  <Input label="Name" required />
  <Input label="Email" type="email" required />
  <Button variant="primary" size="lg" fullWidth>
    Submit
  </Button>
</Card>
```

---

## 🔍 SEO Implementation

### Meta Tags (Done)
✅ Title, description, keywords
✅ OpenGraph tags
✅ Twitter cards
✅ Canonical URLs

### Technical SEO (Done)
✅ robots.txt
✅ sitemap.xml
✅ Structured data (JSON-LD)
✅ PWA manifest

### Content SEO
- Clear headings (h1, h2, h3)
- Alt text for images
- Descriptive links
- Mobile-friendly

---

## 🚀 Performance Guidelines

### Images
- Use Next.js Image component
- WebP format preferred
- Lazy loading by default

### Fonts
- Variable fonts when possible
- Preload critical fonts
- `display: swap` for FOUT

### CSS
- Utility-first (Tailwind)
- Purge unused styles
- Critical CSS inline

---

## 📏 Accessibility

### Colors
- WCAG AA contrast minimum
- Never rely on color alone

### Interactive Elements
- Clear focus states
- Keyboard navigation
- ARIA labels where needed

### Content
- Semantic HTML
- Clear labels
- Alt text for images

---

## 🎨 Brand Voice

### Tone
- **Friendly** but professional
- **Confident** but not arrogant
- **Simple** language, no jargon
- **Helpful** and supportive

### Writing Style
- Short sentences
- Active voice
- Direct and clear
- Indian English (lakh, crore, etc.)

### Example Copy
❌ "Utilize our revolutionary platform"
✅ "Design your home in 5 minutes"

---

## 📦 Assets Checklist

### Required Assets (To Be Created)
- [ ] Logo PNG (various sizes)
- [ ] Favicon (16x16, 32x32)
- [ ] PWA Icons (192x192, 512x512)
- [ ] OG Image (1200x630)
- [ ] Sample house designs
- [ ] Feature illustrations

---

## 🔄 Version History

**v1.0** - Initial branding system
- Color palette defined
- Typography set
- Component library created
- SEO foundation laid

---

## 📞 Questions?

For branding questions or design system additions, refer to this guide or update it as patterns evolve.

**Remember:** Consistency is key. Use the design system components rather than creating one-off styles.
