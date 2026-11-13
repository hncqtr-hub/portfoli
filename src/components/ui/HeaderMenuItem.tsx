'use client';
import Link from'next/link';
import { twMerge } from 'tailwind-merge';
import { ReactNode } from 'react';

interface HeaderMenuItemProps {
  children: ReactNode;
  href?: string;
  textStyleCss?: string;
  className?: string;
  onClick?: () => void;
}

const HeaderMenuItem = ({
  children,
  href = '#',
  textStyleCss = 'text-base font-normal leading-base text-text-white',
  className = '',
  onClick
}: HeaderMenuItemProps) => {
  const handleClick = () => {
    if (onClick) {
      onClick()
    }
  }

  return (
    <Link 
      href={href}
      className={twMerge(
        'inline-flex items-center justify-center px-2 py-1 hover:bg-white hover:bg-opacity-10 rounded transition-colors duration-200',
        textStyleCss,
        className
      )}
      role="menuitem"
      onClick={handleClick}
    >
      {children}
    </Link>
  )
}

export default HeaderMenuItem