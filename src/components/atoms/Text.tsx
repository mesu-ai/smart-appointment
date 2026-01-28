/**
 * Text Atom Component
 * 
 * Purpose: Typography component with variants
 * Variants: h1, h2, h3, body, small, caption
 */

'use client';

import type { ReactNode, ElementType } from 'react';

export interface TextProps {
  variant?: 'h1' | 'h2' | 'h3' | 'body' | 'small' | 'caption';
  children: ReactNode;
  className?: string;
  as?: ElementType;
}

export function Text({ variant = 'body', children, className = '', as }: TextProps) {
  const variantStyles = {
    h1: 'text-3xl font-bold text-gray-900',
    h2: 'text-2xl font-semibold text-gray-900',
    h3: 'text-xl font-semibold text-gray-900',
    body: 'text-base text-gray-700',
    small: 'text-sm text-gray-600',
    caption: 'text-xs text-gray-500',
  };

  const defaultTags: Record<string, ElementType> = {
    h1: 'h1',
    h2: 'h2',
    h3: 'h3',
    body: 'p',
    small: 'p',
    caption: 'span',
  };

  const Component = (as || defaultTags[variant]) as ElementType;

  return (
    <Component className={`${variantStyles[variant]} ${className}`}>
      {children}
    </Component>
  );
}
