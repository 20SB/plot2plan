import React from 'react';
import { clsx } from 'clsx';

interface SectionProps {
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
  background?: 'white' | 'gray' | 'primary' | 'gradient';
  spacing?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Section: React.FC<SectionProps> = ({
  children,
  className,
  containerClassName,
  background = 'white',
  spacing = 'lg',
}) => {
  const backgrounds = {
    white: 'bg-white',
    gray: 'bg-gray-50',
    primary: 'bg-primary-600 text-white',
    gradient: 'bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-600 text-white',
  };
  
  const spacings = {
    sm: 'py-12',
    md: 'py-16',
    lg: 'py-20',
    xl: 'py-24',
  };
  
  return (
    <section className={clsx(backgrounds[background], spacings[spacing], className)}>
      <div className={clsx('max-w-7xl mx-auto px-4 sm:px-6 lg:px-8', containerClassName)}>
        {children}
      </div>
    </section>
  );
};
