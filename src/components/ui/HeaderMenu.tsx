'use client';
import { twMerge } from 'tailwind-merge';
import { ReactNode } from 'react';

interface HeaderMenuProps {
  children: ReactNode;
  gap?: string;
  justifyContent?: string;
  alignItems?: string;
  width?: string;
  className?: string;
}

const HeaderMenu = ({
  children,
  gap = 'gap-4',
  justifyContent = 'center',
  alignItems = 'center',
  width = 'w-auto',
  className = ''
}: HeaderMenuProps) => {
  const justifyMap: Record<string, string> = {
    center: 'justify-center',
    start: 'justify-start',
    end: 'justify-end',
    between: 'justify-between',
    around: 'justify-around',
    evenly: 'justify-evenly'
  }

  const alignMap: Record<string, string> = {
    center: 'items-center',
    start: 'items-start',
    end: 'items-end',
    stretch: 'items-stretch',
    baseline: 'items-baseline'
  }

  return (
    <nav 
      className={twMerge(
        'flex flex-row',
        gap,
        justifyMap[justifyContent] || 'justify-center',
        alignMap[alignItems] || 'items-center',
        width,
        className
      )}
      role="navigation"
      aria-label="Main navigation"
    >
      {children}
    </nav>
  )
}

export default HeaderMenu