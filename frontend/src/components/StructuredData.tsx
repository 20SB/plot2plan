import React from 'react';

export const OrganizationSchema = () => {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Plot2Plan',
    description: 'AI-powered house design and floor plan generator for Indian homes',
    url: 'https://plot2plan.com',
    logo: 'https://plot2plan.com/logo.png',
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      email: 'support@plot2plan.com',
    },
    sameAs: [
      'https://twitter.com/plot2plan',
      'https://facebook.com/plot2plan',
      'https://linkedin.com/company/plot2plan',
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
};

export const SoftwareAppSchema = () => {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Plot2Plan',
    applicationCategory: 'DesignApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'INR',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '150',
    },
    description: 'Generate 2D floor plans, 3D elevations, and complete house designs instantly with AI. Perfect for Indian homes with Vastu compliance.',
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
};

export const FAQSchema = () => {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'How long does it take to generate a house plan?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Plot2Plan can generate complete house plans including 2D floor plans, 3D elevations, and technical drawings in approximately 5-10 minutes.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is Plot2Plan suitable for Indian homes?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, Plot2Plan is specifically designed for Indian homes with features like Vastu compliance, Indian building codes, and common Indian home layouts.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can I download CAD files?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, Pro users can download designs in both PDF and DXF (CAD) formats, ready for submission to authorities and contractors.',
        },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
};
