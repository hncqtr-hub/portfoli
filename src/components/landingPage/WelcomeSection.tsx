"use client";

import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { BrandHeading } from '@/components/ui/BrandHeading';
import Link from 'next/link';

export default function WelcomeSection() {
  const { t, i18n } = useTranslation('common');


  return (
    <section className="relative w-full bg-brand-navy overflow-hidden pt-8 md:pt-24 lg:pt-28 pb-16 md:pb-20 px-4 md:px-8 lg:px-12">
      {/* Ambient glow anchored to the composition */}
      <div
        className="hnc-glow"
        style={{
          background: 'radial-gradient(circle, rgba(227,30,36,0.16), transparent 70%)',
          width: 560,
          height: 560,
          top: '30%',
          right: '-6%',
        }}
      />

      <div className="relative z-10 mx-auto w-full max-w-7xl">
        <div className="flex flex-col md:flex-row items-center min-h-[40vh] md:min-h-[80vh] lg:min-h-[70vh] gap-12 md:gap-8">
          {/* 1st div - Text */}
          <motion.div
            className="flex-1 text-white flex flex-col items-center md:items-start justify-center px-2 sm:px-6 lg:px-12 xl:px-20"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Brand-driven Section Title */}
            <div className="mb-6 w-full flex justify-center md:justify-start">
              <BrandHeading
                as="h2"
                center={false}
                className="items-center md:items-start text-center md:text-left"
                tagline={t('welcome.tagline')}
                textSize="text-3xl sm:text-5xl md:text-5xl lg:text-6xl"
              >
                {t('welcome.title')}
              </BrandHeading>
            </div>

            <div className="max-w-lg text-center md:text-left w-full mx-auto md:mx-0 flex flex-col items-center md:items-start">
              <p className="mina text-sm sm:text-base md:text-lg leading-relaxed text-white/70 text-center md:text-left w-full">
                {t('welcome.description')}
              </p>
              <motion.div
                className="flex justify-center md:justify-start w-full mt-8"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                <Link
                  href="/gallery"
                  className="hnc-btn hnc-btn-primary group w-full max-w-[340px] py-3.5 pl-8 pr-3.5 uppercase tracking-[0.15em]"
                >
                  <span className="philosopher text-base md:text-lg">
                    {t('welcome.button')}
                  </span>

                  <span className="flex items-center justify-center w-9 h-9 rounded-full bg-white/20 group-hover:bg-white/30 transition-colors">
                    <svg
                      className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="3"
                        d="M14 5l7 7m0 0l-7 7m7-7H3"
                      />
                    </svg>
                  </span>
                </Link>
              </motion.div>
            </div>
          </motion.div>

          {/* 2nd div - Image */}
          <motion.div
            className="flex-1 relative w-full min-h-[50vh] md:min-h-[60vh] overflow-hidden mt-4 md:mt-0"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Soft radial glow behind the plate */}
            <div
              className="hnc-glow"
              style={{
                background: 'radial-gradient(circle, rgba(227,30,36,0.20), transparent 70%)',
                width: 460,
                height: 460,
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
              }}
            />
            <img
              src="/images/VEGETABLE_PASTA.png"
              alt="Hot N Cool restaurant friends enjoying food"
              className="absolute inset-0 z-10 w-full h-full max-w-[90%] max-h-[90%] m-auto object-cover rounded-3xl transition-transform duration-700 hover:scale-105 cursor-pointer"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
