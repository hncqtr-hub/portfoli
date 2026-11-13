"use client";
import { useState, useEffect } from 'react';
import { twMerge } from 'tailwind-merge';
import { useTranslation } from 'react-i18next';
import '../../lib/i18n'; // Initialize i18n
import Link from '../ui/Link';
import { usePathname } from 'next/navigation';

/* Navbar height. HeroSection mirrors these values so the image starts
   flush beneath the bar, as in the reference. */
export const NAV_H = 'h-[76px] md:h-[110px] lg:h-[88px]';

interface HeaderProps {
  className?: string;
}

const Header = ({ className = '' }: HeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { t, i18n } = useTranslation('common');
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
    document.documentElement.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  // Prevent scrolling when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMenuOpen]);

  const menuItems = [
    { label: t('header.home'), href: '/' },
    { label: t('header.menu', 'Menu'), href: '/menu' },
    { label: t('header.about'), href: '/about' },
    { label: t('header.findMore'), href: '/findMore' },
    { label: t('header.careers'), href: '/careers' },
    { label: t('header.franchise', 'Franchise'), href: '/franchise' },
  ];

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleLanguage = () =>
    i18n.changeLanguage(i18n.language === 'ar' ? 'en' : 'ar');

  if (!mounted || pathname?.startsWith('/admin')) return null;
  if (!mounted || pathname?.startsWith('/auth')) return null;

  return (
    <>
      <header
        className={twMerge(
          'fixed top-0 left-0 z-50 w-full bg-[#5C0B12] ltr:font-muller',
          NAV_H,
          className,
        )}
      >
        <div className="mx-auto flex h-full w-full max-w-[1320px] items-center gap-4 px-5 lg:grid lg:grid-cols-[1fr_auto_1fr] sm:px-8 lg:gap-[32px] lg:px-[40px] xl:px-[52px]">
          {/* MOBILE MENU TOGGLE */}
          <button
            type="button"
            className="-ms-1 p-2 text-white/90 transition-colors hover:text-white lg:hidden"
            onClick={toggleMenu}
            aria-label="Toggle menu"
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? (
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            ) : (
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            )}
          </button>

          {/* LOGO — one lockup image.

              Sized by HEIGHT, never width: `h-* w-auto object-contain` keeps the
              asset's own aspect and lets the row's `items-center` do the
              centring, so the mark can never overflow a bar of fixed height.

              nav_logo.png is a wide lockup (2481x1048, aspect 2.37) where the
              previous badge was portrait (aspect 0.73), so at these same heights
              it draws about three times wider - 156px against 48px at lg. The
              heights are kept because the bar still has the room: the narrowest
              desktop case, 1024, leaves 75px between the lockup and the centre
              nav. Change the heights, not a width, if that ever gets tight. */}
          <Link
            href="/"
            className="group flex shrink-0 items-center lg:justify-self-start"
          >
            <img
              src="/images/nav_logo.png"
              alt="Hot N Cool"
              className="h-[56px] w-auto object-contain transition-transform duration-300 group-hover:scale-[1.03] md:h-[82px] lg:h-[66px]"
            />
          </Link>

          {/* DESKTOP NAV */}
          <nav className="hidden items-center gap-[20px] lg:flex">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? 'page' : undefined}
                  className={twMerge(
                    'relative whitespace-nowrap pb-1 text-[20px] leading-none transition-colors duration-200 lg:text-[17px]',
                    isActive
                      ? 'text-[#E23A2E] after:absolute after:inset-x-0 after:bottom-0 after:h-[2px] after:rounded-full after:bg-[#E23A2E]'
                      : 'text-white hover:text-white/75',
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* LANGUAGE PILL — toggles straight between EN and AR */}
          <button
            type="button"
            onClick={toggleLanguage}
            className="ms-auto shrink-0 rounded-full bg-[#F7EFD5] px-4 py-1 text-sm font-semibold text-[#B8231C] transition-colors hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white lg:px-3.5 lg:py-0.5 lg:text-[13px]"
          >
            {t('header.language')}
          </button>
        </div>
      </header>

      {/* MOBILE FULL SCREEN MENU OVERLAY */}
      <div
        className={`
          fixed inset-0 z-40 bg-[#5C0B12]/97 backdrop-blur-xl ltr:font-muller
          flex flex-col items-center justify-center
          transition-all duration-500 ease-in-out
          ${isMenuOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible translate-y-[-20px] pointer-events-none'}
        `}
      >
        <nav className="flex w-full flex-col items-center gap-7 px-6">
          {menuItems.map((item, index) => (
            <Link
              key={item.href}
              href={item.href}
              className={`
                text-3xl font-bold tracking-wide
                ${pathname === item.href ? 'text-[#E23A2E]' : 'text-white'}
                transition-colors duration-300
                transform ${isMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}
              `}
              style={{ transitionDelay: `${index * 80}ms` }}
              onClick={() => setIsMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </>
  );
};

export default Header;
