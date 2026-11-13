'use client';
import { twMerge } from 'tailwind-merge';

interface LineProps {
  width?: string;
  height?: string;
  backgroundColor?: string;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

const Line = ({
  width = 'w-full',
  height = 'h-[1px]',
  backgroundColor = 'bg-gray-300',
  orientation = 'horizontal',
  className = ''
}: LineProps) => {
  return (
    <div 
      className={twMerge(
        orientation === 'horizontal' ? 'w-full' : 'h-full',
        width,
        height,
        backgroundColor,
        className
      )}
      role="separator"
      aria-orientation={orientation}
    />
  )
}

export default Line