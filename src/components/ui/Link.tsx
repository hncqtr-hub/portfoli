'use client';
import NextLink from'next/link';
import { twMerge } from 'tailwind-merge';
import { ReactNode } from 'react';

interface LinkProps {
  children: ReactNode;
  href: string;
  className?: string;
  target?: '_blank' | '_self' | '_parent' | '_top';
  rel?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
}

const Link = ({
  children,
  href,
  className = '',
  target,
  rel,
  onClick,
  style
}: LinkProps) => {
  const handleClick = () => {
    if (onClick) {
      onClick()
    }
  }

  return (
    <NextLink 
      href={href}
      className={twMerge(
        'inline-flex items-center justify-center transition-colors duration-200',
        className
      )}
      target={target}
      rel={rel}
      onClick={handleClick}
      style={style}
    >
      {children}
    </NextLink>
  )
}

export default Link