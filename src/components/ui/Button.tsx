'use client';
import { cva, type VariantProps } from 'class-variance-authority';
import { twMerge } from 'tailwind-merge';
import { ButtonHTMLAttributes, ReactNode, CSSProperties } from 'react';

const buttonClasses = cva(
  'inline-flex items-center justify-center font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
  {
    variants: {
      variant: {
        primary: 'bg-brand-red text-white hover:bg-brand-red/90 focus:ring-brand-red',
        secondary: 'bg-white/10 text-white hover:bg-white/20 focus:ring-white/20',
        outline: 'border-2 border-white/20 text-white bg-transparent hover:bg-white/10 focus:ring-white/20',
        danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
        brand: 'bg-brand-red text-white hover:bg-red-700 focus:ring-brand-red',
        "brand-outline": "border-2 border-brand-red text-brand-red bg-transparent hover:bg-brand-red hover:text-white focus:ring-brand-red shadow-lg active:scale-95",
      },
      size: {
        small: 'text-sm px-3 py-1.5',
        medium: 'text-base px-5 py-2.5',
        large: 'text-lg px-8 py-3.5',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'medium',
    },
  }
)

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonClasses> {
  // Required parameters with defaults
  text?: string;
  text_font_size?: string;
  text_font_family?: string;
  text_font_weight?: string;
  text_line_height?: string;
  text_text_align?: string;
  text_color?: string;
  border_border?: string;
  border_border_radius?: string;
  effect_box_shadow?: string;
  
  // Optional parameters
  fill_background_color?: string;
  layout_width?: string;
  padding?: string;
  margin?: string;
  position?: string;
  
  // Standard React props
  children?: ReactNode;
}

const Button = ({
  // Required parameters with defaults
  text = "Menu",
  text_font_size = "text-lg",
  text_font_family = "Inter",
  text_font_weight = "font-normal",
  text_line_height = "leading-xl",
  text_text_align = "left",
  text_color = "text-text-white",
  border_border = "border-[3px] border-solid border-border-button-border",
  border_border_radius = "rounded-md",
  effect_box_shadow = "shadow-[0px_4px_30px_#888888ff]",
  
  // Optional parameters (no defaults)
  fill_background_color,
  layout_width,
  padding,
  margin,
  position,
  
  // Standard React props
  variant,
  size,
  disabled = false,
  className,
  children,
  onClick,
  type = 'button',
  ...props
}: ButtonProps) => {
  // Safe validation for optional parameters
  const hasValidFillBg = fill_background_color && typeof fill_background_color === 'string' && fill_background_color.trim() !== ''
  const hasValidWidth = layout_width && typeof layout_width === 'string' && layout_width.trim() !== ''
  const hasValidPadding = padding && typeof padding === 'string' && padding.trim() !== ''
  const hasValidMargin = margin && typeof margin === 'string' && margin.trim() !== ''
  const hasValidPosition = position && typeof position === 'string' && position.trim() !== ''

  const optionalClasses = [
    hasValidFillBg ? `bg-[${fill_background_color}]` : '',
    hasValidWidth ? `w-[${layout_width}]` : '',
    hasValidPadding ? `p-[${padding}]` : '',
    hasValidMargin ? `m-[${margin}]` : '',
    hasValidPosition ? position : '',
  ].filter(Boolean).join(' ')

  // Build custom styles for non-Tailwind properties
  const customStyles: CSSProperties = {
    // Only use inline styles for truly custom values
    ...(text_font_family && !text_font_family.startsWith('font-') && { fontFamily: text_font_family }),
    ...(text_text_align && { textAlign: text_text_align as 'left' | 'center' | 'right' | 'justify' }),
  }

  // Build Tailwind classes for styling
  const styleClasses = [
    text_font_size,
    text_font_family.startsWith('font-') ? text_font_family : '',
    text_font_weight,
    text_line_height,
    text_color,
    // Only apply these if not using variant system
    !variant && !hasValidFillBg ? 'bg-transparent' : '',
    !variant ? border_border : '',
    border_border_radius,
    effect_box_shadow,
  ].filter(Boolean).join(' ')

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) {
      event.preventDefault()
      return
    }
    
    if (typeof onClick === 'function') {
      onClick(event)
    }
  }

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={handleClick}
      style={customStyles}
      className={twMerge(
        buttonClasses({ variant, size }),
        styleClasses,
        optionalClasses,
        className
      )}
      aria-disabled={disabled}
      {...props}
    >
      {children || text}
    </button>
  )
}

export default Button