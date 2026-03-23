import React from 'react';
import { clsx } from 'clsx';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'bordered' | 'elevated';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'lg',
  className,
  hover = false,
}) => {
  const baseStyles = 'bg-white rounded-xl';
  
  const variants = {
    default: 'shadow-soft',
    bordered: 'border-2 border-gray-200',
    elevated: 'shadow-soft-lg',
  };
  
  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-10',
  };
  
  const hoverStyles = hover ? 'transition-all duration-200 hover:shadow-soft-lg hover:-translate-y-1' : '';
  
  return (
    <div
      className={clsx(
        baseStyles,
        variants[variant],
        paddings[padding],
        hoverStyles,
        className
      )}
    >
      {children}
    </div>
  );
};
